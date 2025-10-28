import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PostCard } from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/PostCardSkeleton';
import { CommentThread } from '@/components/CommentThread';
import { CommentSkeleton } from '@/components/CommentSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, User } from 'lucide-react';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users (username),
        categories (name),
        subs (name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
    } else {
      setPost(data);
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        users (username)
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    setComments(data || []);
  };

  const { toast } = useToast();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment.",
      });
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          body: newComment,
          post_id: id,
          user_id: user.id,
          created_at: new Date().toISOString()
        });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setNewComment('');
        fetchComments();
        toast({
          title: "Success!",
          description: "Your comment has been posted.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="container max-w-4xl mx-auto px-2 md:px-4 py-4 md:py-8">
          <div className="space-y-4 md:space-y-6">
            <PostCardSkeleton />
            <Card className="rounded-lg md:rounded-xl">
              <CardHeader className="p-3 md:p-6">
                <h3 className="text-base md:text-lg font-semibold">Comments</h3>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0 space-y-4">
                {[1, 2, 3].map((i) => (
                  <CommentSkeleton key={i} />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Post not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="container max-w-4xl mx-auto px-2 md:px-4 py-4 md:py-8">
        <div className="space-y-4 md:space-y-6">
          {/* Post */}
          <PostCard post={post} showFullContent={true} />

          {/* Comments Section */}
          <Card className="rounded-lg md:rounded-xl">
            <CardHeader className="p-3 md:p-6">
              <h3 className="text-base md:text-lg font-semibold">
                Comments ({comments.length})
              </h3>
            </CardHeader>
            
            <CardContent className="p-3 md:p-6 pt-0 space-y-4 md:space-y-6">
              {/* Add Comment Form */}
              {user ? (
                <form onSubmit={handleSubmitComment} className="space-y-3">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="rounded-lg text-sm md:text-base"
                  />
                  <Button 
                    type="submit" 
                    disabled={submitting || !newComment.trim()}
                    className="rounded-lg w-full md:w-auto"
                    size="sm"
                  >
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2 text-sm md:text-base">
                    Sign in to join the conversation
                  </p>
                  <Button asChild variant="outline" className="rounded-lg" size="sm">
                    <a href="/auth">Sign In</a>
                  </Button>
                </div>
              )}

              {/* Comments List - Now using CommentThread for threading and voting */}
              <div className="space-y-2 md:space-y-4">
                {comments
                  .filter(comment => !comment.parent_id) // Only show top-level comments
                  .map((comment) => (
                    <CommentThread
                      key={comment.id}
                      comment={comment}
                      postId={post.id}
                      onCommentAdded={fetchComments}
                    />
                  ))}
                
                {comments.length === 0 && (
                  <p className="text-center text-muted-foreground py-6 md:py-8 text-sm md:text-base">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}