import React, { useState, useEffect } from 'react'
import { MessageCircle, Calendar, User, Code2, Image as ImageIcon, Video, Send, Bookmark } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { formatDistanceToNow } from '../utils/dateUtils'
import CodeBlock from './CodeBlock'
import { useSavedSnippets } from '../hooks/useSavedSnippets'

type CodeRoomPost = Database['public']['Tables']['coderoom_posts']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  comment_count: number
}

type CodeRoomComment = Database['public']['Tables']['coderoom_comments']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  replies?: CodeRoomComment[]
}

interface PostCardProps {
  post: CodeRoomPost
  isAdmin: boolean
  currentUserId: string
}

const PostCard: React.FC<PostCardProps> = ({ post, isAdmin, currentUserId }) => {
  const [comments, setComments] = useState<CodeRoomComment[]>([])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const { toggleSaveSnippet, isSnippetSaved } = useSavedSnippets()
  const isSaved = isSnippetSaved(post.id)

  useEffect(() => {
    if (showComments) {
      fetchComments()
      setupRealtimeSubscription()
    }
  }, [showComments, post.id])

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('coderoom_comments')
        .select(`*, profiles ( id, username, full_name, avatar_url )`)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })

      if (error) return console.error('Error fetching comments:', error)

      const topLevelComments = data.filter(comment => !comment.parent_comment_id)
      const repliesMap = new Map<string, CodeRoomComment[]>()

      data.filter(comment => comment.parent_comment_id).forEach(reply => {
        const parentId = reply.parent_comment_id!
        if (!repliesMap.has(parentId)) repliesMap.set(parentId, [])
        repliesMap.get(parentId)!.push(reply)
      })

      const commentsWithReplies = topLevelComments.map(comment => ({
        ...comment,
        replies: repliesMap.get(comment.id) || []
      }))

      setComments(commentsWithReplies)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel(`post-comments-${post.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'coderoom_comments',
        filter: `post_id=eq.${post.id}`
      }, fetchComments)
      .subscribe()

    return () => subscription.unsubscribe()
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase.from('coderoom_comments').insert([
        {
          post_id: post.id,
          user_id: currentUserId,
          comment_text: newComment,
          parent_comment_id: replyTo,
        },
      ])
      if (error) console.error('Error creating comment:', error)
      else {
        setNewComment('')
        setReplyTo(null)
        fetchComments()
      }
    } catch (error) {
      console.error('Error creating comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    toggleSaveSnippet(post.id)
  }

  const toggleComments = () => setShowComments(!showComments)
  const handleReply = (commentId: string) => {
    setReplyTo(commentId)
    setShowComments(true)
  }

  return (
    <div className="bg-transparent border border-gray-700/40 backdrop-blur-lg rounded-xl shadow-lg hover:shadow-purple-900/30 transition-all duration-300 overflow-hidden text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/30">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold">{post.title}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <User className="h-4 w-4" />
            <span>{post.profiles.username}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-300">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
          </div>
          <button onClick={toggleComments} className="flex items-center gap-1 hover:text-purple-400 transition-colors">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comment_count} comments</span>
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1 transition-colors ${
              isSaved
                ? 'text-blue-400 hover:text-blue-300'
                : 'text-gray-400 hover:text-purple-400'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {post.content && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="h-5 w-5 text-gray-300" />
              <span className="text-sm font-medium text-gray-300">Code</span>
            </div>
            <CodeBlock code={post.content} language="javascript" showCopyButton={true} />
          </div>
        )}

        {post.media_url && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              {post.media_type === 'video' ? (
                <Video className="h-5 w-5 text-gray-300" />
              ) : (
                <ImageIcon className="h-5 w-5 text-gray-300" />
              )}
              <span className="text-sm font-medium text-gray-300">
                {post.media_type === 'video' ? 'Video' : 'Image'}
              </span>
            </div>
            <div className="rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm border border-gray-700/30">
              {post.media_type === 'video' ? (
                <video src={post.media_url} className="w-full max-h-96 object-contain" controls />
              ) : (
                <img src={post.media_url} alt="Post media" className="w-full max-h-96 object-contain" />
              )}
            </div>
          </div>
        )}
      </div>

      {showComments && (
        <div className="border-t border-gray-700/30 bg-black/20 backdrop-blur-sm transition-colors">
          <div className="p-6">
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">
                    {currentUserId[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  {replyTo && (
                    <div className="mb-2 text-sm text-gray-400">
                      Replying to comment...
                      <button
                        type="button"
                        onClick={() => setReplyTo(null)}
                        className="ml-2 text-purple-400 hover:text-purple-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 border border-gray-600 bg-black/30 text-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={loading || !newComment.trim()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">
                        {comment.profiles.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-purple-300">
                            {comment.profiles.username}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{comment.comment_text}</p>
                      </div>
                      {isAdmin && (
                        <button onClick={() => handleReply(comment.id)} className="mt-1 text-xs text-purple-400 hover:text-purple-300">
                          Reply
                        </button>
                      )}
                    </div>
                  </div>

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-11 space-y-3">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="flex gap-3">
                          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-medium">
                              {reply.profiles.username[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-purple-300">
                                  {reply.profiles.username}
                                  <span className="ml-1 text-xs text-purple-400">(Admin)</span>
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300">{reply.comment_text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostCard
