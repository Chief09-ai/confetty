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
    users?: { username: string };
    categories?: { name: string };
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

    try {
      if (userVote === voteType) {
        // Remove vote
        await supabase
          .from('votes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        setUserVote(null);
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
        setUserVote(voteType);
      }
      
      fetchVotes();
    } catch (error) {
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
    <Card className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>u/{post.users?.username || 'Unknown'}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(post.created_at)}
          </div>
          {post.categories && (
            <>
              <span>•</span>
              <Badge variant="secondary" className="text-xs">
                {post.categories.name}
              </Badge>
            </>
          )}
        </div>
        
        <Link to={`/post/${post.id}`}>
          <h3 className="text-lg font-semibold hover:text-primary transition-colors">
            {post.title}
          </h3>
        </Link>
      </CardHeader>
      
      <CardContent>
        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-48 object-cover rounded-lg mb-3"
          />
        )}
        
        <p className="text-muted-foreground mb-4">
          {showFullContent ? post.body : `${post.body?.slice(0, 200)}${post.body?.length > 200 ? '...' : ''}`}
        </p>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button
              variant={userVote === 1 ? "default" : "ghost"}
              size="sm"
              onClick={() => handleVote(1)}
              className="h-8 w-8 p-0 rounded-full"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            
            <span className="font-medium text-sm min-w-[2rem] text-center">
              {votes}
            </span>
            
            <Button
              variant={userVote === -1 ? "destructive" : "ghost"}
              size="sm"
              onClick={() => handleVote(-1)}
              className="h-8 w-8 p-0 rounded-full"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          
          <Link to={`/post/${post.id}`}>
            <Button variant="ghost" size="sm" className="rounded-full">
              <MessageCircle className="h-4 w-4 mr-2" />
              {commentsCount} comments
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}