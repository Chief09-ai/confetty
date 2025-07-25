import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MessageSquare, ThumbsUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { PostCard } from '@/components/PostCard';

interface UserProfile {
  id: string;
  username: string;
  joined_at: string;
}

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [stats, setStats] = useState({
    postsCount: 0,
    commentsCount: 0,
    totalVotes: 0
  });

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('users')
        .select('id, username, joined_at')
        .eq('username', username)
        .single();

      if (!profileData) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch user's posts
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          users:user_id (username),
          categories:category_id (name),
          subs:sub_id (name)
        `)
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (postsData) {
        setPosts(postsData);
      }

      // Fetch user's comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          *,
          posts:post_id (id, title)
        `)
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (commentsData) {
        setComments(commentsData);
      }

      // Fetch stats
      const [
        { count: postsCount },
        { count: commentsCount },
        { data: votesData }
      ] = await Promise.all([
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profileData.id),
        supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profileData.id),
        supabase
          .from('votes')
          .select('vote_type')
          .in('post_id', postsData?.map(p => p.id) || [])
      ]);

      const totalVotes = votesData?.reduce((sum, vote) => sum + vote.vote_type, 0) || 0;

      setStats({
        postsCount: postsCount || 0,
        commentsCount: commentsCount || 0,
        totalVotes
      });

    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery="" onSearchChange={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading user profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery="" onSearchChange={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">User not found</h1>
            <p className="text-muted-foreground mb-4">
              The user "{username}" doesn't exist or may have been deleted.
            </p>
            <Link to="/">
              <Button>Go back home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery="" onSearchChange={() => {}} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center">
                <span className="text-2xl md:text-3xl font-bold text-primary-foreground">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl md:text-2xl">u/{profile.username}</CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Joined {formatDate(profile.joined_at)}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg md:text-xl font-bold">{stats.postsCount}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Posts</div>
              </div>
              <div>
                <div className="text-lg md:text-xl font-bold">{stats.commentsCount}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Comments</div>
              </div>
              <div>
                <div className="text-lg md:text-xl font-bold">{stats.totalVotes}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Votes Received</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'posts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('posts')}
            size="sm"
          >
            Posts ({stats.postsCount})
          </Button>
          <Button
            variant={activeTab === 'comments' ? 'default' : 'outline'}
            onClick={() => setActiveTab('comments')}
            size="sm"
          >
            Comments ({stats.commentsCount})
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">
                    {profile.username} hasn't created any posts yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">
                          Comment on {' '}
                          <Link 
                            to={`/post/${comment.posts?.id}`}
                            className="text-primary hover:underline"
                          >
                            {comment.posts?.title}
                          </Link>
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {comment.body}
                        </p>
                        <div className="text-xs text-muted-foreground mt-2">
                          {formatDate(comment.created_at)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
                  <p className="text-muted-foreground">
                    {profile.username} hasn't made any comments yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}