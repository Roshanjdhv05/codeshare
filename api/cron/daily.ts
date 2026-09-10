/**
 * /api/cron/daily.ts
 *
 * Vercel Serverless Function — Daily Maintenance Cron Job
 *
 * Triggered once per day by Vercel Cron (configured in vercel.json).
 * The Vercel runtime automatically sends an `Authorization` header with the
 * value of the CRON_SECRET environment variable.  We validate this before
 * doing any work to prevent unauthorised callers from triggering the job.
 *
 * Uses the Supabase SERVICE ROLE key (not the anon/public key) so that it
 * can bypass Row Level Security and operate on data across all users.
 *
 * Tasks executed (in order):
 *   1. Delete old read notifications  (>30 days old, already read)
 *   2. Clean up messages from rejected friendships
 *   3. Sync snippet like counts  (reconcile likes column with likes table)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TaskResult {
  task: string;
  success: boolean;
  affected?: number;
  error?: string;
}

// ---------------------------------------------------------------------------
// Supabase admin client factory
// Uses the service role key — NEVER expose this key to the browser.
// ---------------------------------------------------------------------------

function createAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing required environment variables: (SUPABASE_URL or VITE_SUPABASE_URL) and/or SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      // Disable automatic session persistence — this is a server-side client
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// ---------------------------------------------------------------------------
// Maintenance task helpers
// ---------------------------------------------------------------------------

/**
 * Task 1 — Delete notifications that are already read AND older than 30 days.
 * These are safe to purge as users have already seen them.
 */
async function deleteOldReadNotifications(
  supabase: ReturnType<typeof createAdminClient>
): Promise<TaskResult> {
  const task = 'delete_old_read_notifications';
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const { error, count } = await supabase
      .from('notifications')
      .delete({ count: 'exact' })
      .eq('is_read', true)
      .lt('created_at', cutoffDate.toISOString());

    if (error) throw error;

    console.log(`[cron/daily] ${task}: deleted ${count ?? 0} notifications`);
    return { task, success: true, affected: count ?? 0 };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron/daily] ${task} FAILED:`, message);
    return { task, success: false, error: message };
  }
}

/**
 * Task 2 — Delete messages that belong to a rejected friendship.
 * Once a friendship is rejected, the chat history is stale and can be cleaned up.
 */
async function cleanupRejectedFriendMessages(
  supabase: ReturnType<typeof createAdminClient>
): Promise<TaskResult> {
  const task = 'cleanup_rejected_friend_messages';
  try {
    // Fetch all pairs of users with a rejected friendship
    const { data: rejectedFriendships, error: fetchError } = await supabase
      .from('friendships')
      .select('sender_id, receiver_id')
      .eq('status', 'rejected');

    if (fetchError) throw fetchError;
    if (!rejectedFriendships || rejectedFriendships.length === 0) {
      console.log(`[cron/daily] ${task}: no rejected friendships found, skipping`);
      return { task, success: true, affected: 0 };
    }

    let totalDeleted = 0;

    // Delete messages for each rejected pair
    for (const { sender_id, receiver_id } of rejectedFriendships) {
      const { error: deleteError, count } = await supabase
        .from('messages')
        .delete({ count: 'exact' })
        .or(
          `and(sender_id.eq.${sender_id},receiver_id.eq.${receiver_id}),` +
          `and(sender_id.eq.${receiver_id},receiver_id.eq.${sender_id})`
        );

      if (deleteError) {
        console.error(`[cron/daily] ${task}: error deleting messages for pair`, deleteError.message);
        // Continue with remaining pairs — don't abort the whole task
        continue;
      }

      totalDeleted += count ?? 0;
    }

    console.log(`[cron/daily] ${task}: deleted ${totalDeleted} messages from ${rejectedFriendships.length} rejected friendships`);
    return { task, success: true, affected: totalDeleted };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron/daily] ${task} FAILED:`, message);
    return { task, success: false, error: message };
  }
}

/**
 * Task 3 — Sync the denormalized `likes` counter on code_snippets with the
 * actual count in the `likes` table.
 *
 * This is a reconciliation step to fix any drift caused by race conditions or
 * failed transactions over the past day.
 */
async function syncSnippetLikeCounts(
  supabase: ReturnType<typeof createAdminClient>
): Promise<TaskResult> {
  const task = 'sync_snippet_like_counts';
  try {
    // Get all snippets with their true like count from the likes join table
    const { data: likeCounts, error: countError } = await supabase
      .from('likes')
      .select('snippet_id');

    if (countError) throw countError;

    if (!likeCounts || likeCounts.length === 0) {
      console.log(`[cron/daily] ${task}: no likes found, skipping`);
      return { task, success: true, affected: 0 };
    }

    // Aggregate counts per snippet_id
    const countMap: Record<string, number> = {};
    for (const { snippet_id } of likeCounts) {
      countMap[snippet_id] = (countMap[snippet_id] ?? 0) + 1;
    }

    let updatedCount = 0;

    // Update each snippet's likes counter
    for (const [snippetId, count] of Object.entries(countMap)) {
      const { error: updateError } = await supabase
        .from('code_snippets')
        .update({ likes: count })
        .eq('id', snippetId)
        .neq('likes', count); // Only update rows where the count has drifted

      if (updateError) {
        console.error(`[cron/daily] ${task}: failed to update snippet ${snippetId}:`, updateError.message);
        continue;
      }

      updatedCount++;
    }

    console.log(`[cron/daily] ${task}: reconciled ${updatedCount} snippet(s)`);
    return { task, success: true, affected: updatedCount };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron/daily] ${task} FAILED:`, message);
    return { task, success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

  // --------------------------------------------------
  // 1. Security — validate the cron secret token.
  //    Vercel automatically injects the Authorization header when invoking
  //    cron jobs. We reject all other callers immediately.
  // --------------------------------------------------
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers['authorization'] ?? '';
  const incomingToken = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!cronSecret) {
    console.error('[cron/daily] CRON_SECRET environment variable is not set');
    return res.status(500).json({ error: 'Server misconfiguration: missing CRON_SECRET' });
  }

  if (incomingToken !== cronSecret) {
    console.warn('[cron/daily] Unauthorised request — invalid or missing token');
    return res.status(401).json({ error: 'Unauthorised' });
  }

  // --------------------------------------------------
  // 2. Only allow GET requests (Vercel crons use GET)
  // --------------------------------------------------
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  console.log('[cron/daily] Job started at', new Date().toISOString());

  // --------------------------------------------------
  // 3. Initialise the Supabase admin client
  // --------------------------------------------------
  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[cron/daily] Failed to initialise Supabase client:', message);
    return res.status(500).json({ error: message });
  }

  // --------------------------------------------------
  // 4. Run all maintenance tasks.
  //    Each task is isolated — a failure in one does NOT
  //    stop the remaining tasks from running.
  // --------------------------------------------------
  const results: TaskResult[] = await Promise.all([
    deleteOldReadNotifications(supabase),
    cleanupRejectedFriendMessages(supabase),
    syncSnippetLikeCounts(supabase),
  ]);

  const durationMs = Date.now() - startTime;
  const failedTasks = results.filter((r) => !r.success);
  const overallSuccess = failedTasks.length === 0;

  console.log(
    `[cron/daily] Job finished in ${durationMs}ms — ` +
    `${results.length - failedTasks.length}/${results.length} tasks succeeded`
  );

  // --------------------------------------------------
  // 5. Return a structured JSON response.
  //    Vercel Cron logs show this in the dashboard.
  // --------------------------------------------------
  return res.status(overallSuccess ? 200 : 207).json({
    success: overallSuccess,
    timestamp: new Date().toISOString(),
    durationMs,
    tasks: results,
    ...(failedTasks.length > 0 && {
      warnings: `${failedTasks.length} task(s) failed — check individual task errors above`,
    }),
  });
}
