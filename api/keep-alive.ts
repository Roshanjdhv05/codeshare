/**
 * /api/keep-alive.ts
 *
 * Vercel Serverless Function — Supabase Keep-Alive Ping
 *
 * Triggered once per day by the Vercel Cron Job configured in vercel.json.
 * Its sole purpose is to issue a minimal, read-only query against Supabase so
 * that the free-tier project does not get automatically paused due to inactivity.
 *
 * Security model
 * ──────────────
 * Vercel automatically attaches an `Authorization: Bearer <CRON_SECRET>` header
 * when it invokes a cron route. We validate this token before doing any work,
 * so arbitrary internet callers cannot trigger the function.
 *
 * Environment variables required (server-side only — no VITE_ prefix)
 * ────────────────────────────────────────────────────────────────────
 *   SUPABASE_URL              — your project URL (e.g. https://xxxx.supabase.co)
 *   SUPABASE_SERVICE_ROLE_KEY — service role JWT (bypasses RLS for server ops)
 *   CRON_SECRET               — shared secret validated against the Authorization header
 *
 * These are intentionally distinct from the client-side VITE_SUPABASE_URL /
 * VITE_SUPABASE_ANON_KEY variables so that the service role key is never
 * bundled into or accessible from the browser.
 *
 * Query strategy
 * ──────────────
 * We SELECT the `id` column of the first row in the `categories` table.
 * `categories` is a small, stable reference table (category names / colours)
 * that is always present and populated. The query:
 *   • touches only 1 row
 *   • reads only 1 lightweight column (uuid)
 *   • never modifies, inserts, updates, or deletes any data
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Supabase admin client
// Uses the SERVICE ROLE key — this must NEVER be sent to or used by the browser.
// ---------------------------------------------------------------------------

function createAdminClient() {
  // Prefer the server-only SUPABASE_URL; fall back to the already-deployed
  // VITE_SUPABASE_URL if the dedicated variable hasn't been added yet.
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing required environment variables: ' +
      '(SUPABASE_URL or VITE_SUPABASE_URL) and/or SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

  // ── 1. Only accept GET (Vercel Cron always uses GET) ──────────────────────
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ── 2. Validate the CRON_SECRET ───────────────────────────────────────────
  //    Vercel injects: Authorization: Bearer <CRON_SECRET>
  //    We strip the "Bearer " prefix and compare with the stored secret.
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[keep-alive] CRON_SECRET environment variable is not set');
    return res
      .status(500)
      .json({ error: 'Server misconfiguration: missing CRON_SECRET' });
  }

  const authHeader = (req.headers['authorization'] ?? '') as string;
  const incomingToken = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (incomingToken !== cronSecret) {
    // Log a warning but do NOT echo back the incoming token.
    console.warn('[keep-alive] Rejected request — invalid or missing Authorization token');
    return res.status(401).json({ error: 'Unauthorised' });
  }

  // ── 3. Initialise the Supabase admin client ───────────────────────────────
  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[keep-alive] Failed to initialise Supabase client:', message);
    return res.status(500).json({ error: message });
  }

  // ── 4. Issue the lightweight keep-alive query ─────────────────────────────
  //    SELECT id FROM categories LIMIT 1
  //    • categories is a small, stable reference table
  //    • We fetch only the id column and cap results at 1 row
  //    • This is strictly read-only — no writes of any kind
  console.log('[keep-alive] Sending keep-alive ping to Supabase at', new Date().toISOString());

  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .limit(1)
    .maybeSingle();

  const durationMs = Date.now() - startTime;

  if (error) {
    // Log the full error server-side but return only a generic message.
    console.error('[keep-alive] Supabase query failed:', error.message, error.code);
    return res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      durationMs,
      error: 'Supabase query failed — see server logs for details',
    });
  }

  const rowFound = data !== null;
  console.log(
    `[keep-alive] Ping successful in ${durationMs}ms — row found: ${rowFound}`
  );

  return res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    durationMs,
    message: 'Supabase keep-alive ping completed successfully',
    rowFound,
  });
}
