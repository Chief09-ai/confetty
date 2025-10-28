import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp, ChevronDown, MessageCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    body: string;
    image_url?: string;
    created_at: string;
    user_id: string;
    category_id: string;
    sub_id?: string;
    users?: { username: string };
    categories?: { name: string };
    subs?: { name: string };
  };
  showFullContent?: boolean;
}

export function PostCard({ post, showFullContent = false }: PostCardProps) {
  const { user } = useAuth();
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    fetchVotes();
    fetchCommentsCount();
    if (user) {
      fetchUserVote();
    }

    // Set up real-time subscription for votes
    const channel = supabase
      .channel(`post-votes-${post.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `post_id=eq.${post.id}`
        },
        () => {
          fetchVotes();
          if (user) {
            fetchUserVote();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id, user]);

  const fetchVotes = async () => {
    const { data } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('post_id', post.id);
    
    if (data) {
      const totalVotes = data.reduce((sum, vote) => sum + vote.vote_type, 0);
      setVotes(totalVotes);
    }
  };

  const fetchUserVote = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('post_id', post.id)
      .eq('user_id', user.id)
      .single();
    
    setUserVote(data?.vote_type || null);
  };

  const fetchCommentsCount = async () => {
    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id);
    
    setCommentsCount(count || 0);
  };

  const handleVote = async (voteType: number) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on posts.",
      });
      return;
    }

    // Store previous state for rollback
    const prevVote = userVote;
    const prevVotes = votes;

    try {
      // Optimistic update
      if (userVote === voteType) {
        // Remove vote
        setUserVote(null);
        setVotes(votes - voteType);
      } else if (userVote) {
        // Change vote
        setUserVote(voteType);
        setVotes(votes - userVote + voteType);
      } else {
        // Add new vote
        setUserVote(voteType);
        setVotes(votes + voteType);
      }

      // Perform actual database operation
      if (prevVote === voteType) {
        // Remove vote
        await supabase
          .from('votes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
      } else {
        // Add or update vote
        await supabase
          .from('votes')
          .upsert({
            post_id: post.id,
            user_id: user.id,
            vote_type: voteType,
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      // Rollback on error
      setUserVote(prevVote);
      setVotes(prevVotes);
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="rounded-lg md:rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="p-3 md:p-6 pb-2 md:pb-3">
        <div className="flex flex-wrap items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground mb-2">
          {post.subs && (
            <>
              <Link to={`/c/${post.subs.name}`}>
                <Badge variant="secondary" className="text-xs hover:bg-secondary/80 cursor-pointer">
                  c/{post.subs.name}
                </Badge>
              </Link>
              <span className="hidden md:inline">•</span>
            </>
          )}
          <Link to={`/u/${post.users?.username}`} className="hover:text-primary transition-colors">
            <span className="break-all">u/{post.users?.username || 'Unknown'}</span>
          </Link>
          <span className="hidden md:inline">•</span>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <Calendar className="h-3 w-3" />
            <span className="hidden md:inline">{formatDate(post.created_at)}</span>
            <span className="md:hidden">{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          {post.categories && !post.subs && (
            <>
              <span className="hidden md:inline">•</span>
              <Link to={`/category/${post.category_id}`}>
                <Badge variant="outline" className="text-xs hover:bg-secondary/80 cursor-pointer">
                  {post.categories.name}
                </Badge>
              </Link>
            </>
          )}
        </div>
        
        <Link to={`/post/${post.id}`}>
          <h3 className="text-base md:text-lg font-semibold hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
      </CardHeader>
      
      <CardContent className="p-3 md:p-6 pt-0">
        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-32 md:h-48 object-cover rounded-lg mb-3"
          />
        )}
        
        <p className="text-muted-foreground mb-4 text-sm md:text-base line-clamp-3">
          {showFullContent ? post.body : `${post.body?.slice(0, 150)}${post.body?.length > 150 ? '...' : ''}`}
        </p>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1">
            <Button
              variant={userVote === 1 ? "default" : "ghost"}
              size="sm"
              onClick={() => handleVote(1)}
              className="h-7 w-7 md:h-8 md:w-8 p-0 rounded-full"
            >
              <ChevronUp className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            
            <span className="font-medium text-xs md:text-sm min-w-[1.5rem] md:min-w-[2rem] text-center">
              {votes}
            </span>
            
            <Button
              variant={userVote === -1 ? "destructive" : "ghost"}
              size="sm"
              onClick={() => handleVote(-1)}
              className="h-7 w-7 md:h-8 md:w-8 p-0 rounded-full"
            >
              <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
          
          <Link to={`/post/${post.id}`}>
            <Button variant="ghost" size="sm" className="rounded-full text-xs md:text-sm px-2 md:px-3">
              <MessageCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">{commentsCount} comments</span>
              <span className="md:hidden">{commentsCount}</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}