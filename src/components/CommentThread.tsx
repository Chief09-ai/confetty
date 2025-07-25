import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, ChevronUp, ChevronDown, Reply } from "lucide-react";

interface Comment {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  parent_id?: string;
  users: {
    username: string;
  };
  replies?: Comment[];
  votes?: number;
  userVote?: number;
}

interface CommentThreadProps {
  comment: Comment;
  postId: string;
  depth?: number;
  onCommentAdded?: () => void;
}

export function CommentThread({ comment, postId, depth = 0, onCommentAdded }: CommentThreadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [votes, setVotes] = useState(comment.votes || 0);
  const [userVote, setUserVote] = useState(comment.userVote || 0);
  const [replies, setReplies] = useState<Comment[]>(comment.replies || []);

  useEffect(() => {
    fetchCommentVotes();
    fetchReplies();
  }, [comment.id, user]);

  const fetchCommentVotes = async () => {
    try {
      // Get vote count
      const { data: votesData } = await supabase
        .from('comment_votes')
        .select('vote_type')
        .eq('comment_id', comment.id);

      const voteSum = votesData?.reduce((sum, vote) => sum + vote.vote_type, 0) || 0;
      setVotes(voteSum);

      // Get user's vote if authenticated
      if (user) {
        const { data: userVoteData } = await supabase
          .from('comment_votes')
          .select('vote_type')
          .eq('comment_id', comment.id)
          .eq('user_id', user.id)
          .maybeSingle();

        setUserVote(userVoteData?.vote_type || 0);
      }
    } catch (error) {
      console.error('Error fetching comment votes:', error);
    }
  };

  const fetchReplies = async () => {
    try {
      const { data: repliesData } = await supabase
        .from('comments')
        .select(`
          *,
          users:user_id (username)
        `)
        .eq('parent_id', comment.id)
        .order('created_at', { ascending: true });

      if (repliesData) {
        // Fetch votes for each reply
        const repliesWithVotes = await Promise.all(
          repliesData.map(async (reply) => {
            const { data: voteData } = await supabase
              .from('comment_votes')
              .select('vote_type')
              .eq('comment_id', reply.id);

            const voteSum = voteData?.reduce((sum, vote) => sum + vote.vote_type, 0) || 0;

            let userVoteValue = 0;
            if (user) {
              const { data: userVoteData } = await supabase
                .from('comment_votes')
                .select('vote_type')
                .eq('comment_id', reply.id)
                .eq('user_id', user.id)
                .maybeSingle();
              userVoteValue = userVoteData?.vote_type || 0;
            }

            return {
              ...reply,
              votes: voteSum,
              userVote: userVoteValue
            };
          })
        );

        setReplies(repliesWithVotes);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleVote = async (voteType: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote on comments.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: existingVote } = await supabase
        .from('comment_votes')
        .select('vote_type')
        .eq('comment_id', comment.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote
          await supabase
            .from('comment_votes')
            .delete()
            .eq('comment_id', comment.id)
            .eq('user_id', user.id);
          setUserVote(0);
          setVotes(votes - voteType);
        } else {
          // Update vote
          await supabase
            .from('comment_votes')
            .update({ vote_type: voteType })
            .eq('comment_id', comment.id)
            .eq('user_id', user.id);
          setUserVote(voteType);
          setVotes(votes - existingVote.vote_type + voteType);
        }
      } else {
        // Insert new vote
        await supabase
          .from('comment_votes')
          .insert({
            comment_id: comment.id,
            user_id: user.id,
            vote_type: voteType,
            created_at: new Date().toISOString()
          });
        setUserVote(voteType);
        setVotes(votes + voteType);
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
      toast({
        title: "Error",
        description: "Failed to register vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyText.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          body: replyText.trim(),
          post_id: postId,
          parent_id: comment.id,
          user_id: user.id,
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          users:user_id (username)
        `)
        .single();

      if (error) throw error;

      // Add the new reply to the list
      const newReply = {
        ...data,
        votes: 0,
        userVote: 0
      };
      setReplies([...replies, newReply]);
      setReplyText("");
      setShowReplyForm(false);
      onCommentAdded?.();

      toast({
        title: "Reply posted!",
        description: "Your reply has been added to the discussion.",
      });
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`${depth > 0 ? 'ml-4 md:ml-8 border-l border-border pl-4' : ''} mb-4`}>
      <div className="bg-card rounded-lg p-3 md:p-4">
        <div className="flex items-start gap-2 md:gap-3">
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote(1)}
              className={`h-6 w-6 p-0 ${userVote === 1 ? 'text-orange-500' : 'text-muted-foreground'}`}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <span className={`text-xs font-medium ${votes > 0 ? 'text-orange-500' : votes < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {votes}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote(-1)}
              className={`h-6 w-6 p-0 ${userVote === -1 ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Comment content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <Link to={`/u/${comment.users?.username}`} className="font-medium hover:text-primary transition-colors">
                u/{comment.users?.username || 'unknown'}
              </Link>
              <span>•</span>
              <span>{formatDate(comment.created_at)}</span>
            </div>
            <p className="text-sm text-foreground mb-3 whitespace-pre-wrap break-words">
              {comment.body}
            </p>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="h-7 px-2 text-xs"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
              {replies.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3 inline mr-1" />
                  {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Reply form */}
        {showReplyForm && user && (
          <form onSubmit={handleReplySubmit} className="mt-3 ml-6 md:ml-12">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="mb-2 min-h-[80px] text-sm"
            />
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={submitting || !replyText.trim()}
                size="sm"
              >
                {submitting ? "Posting..." : "Reply"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowReplyForm(false)}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {showReplyForm && !user && (
          <div className="mt-3 ml-6 md:ml-12 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Please sign in to reply to this comment.
            </p>
          </div>
        )}
      </div>

      {/* Render replies */}
      {replies.length > 0 && (
        <div className="mt-2">
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              onCommentAdded={onCommentAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}