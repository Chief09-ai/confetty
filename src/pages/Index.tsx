import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PostCard } from '@/components/PostCard';
import { SearchResults } from '@/components/SearchResults';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Clock } from 'lucide-react';

const Index = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const fetchPosts = async () => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          users:user_id (username),
          categories:category_id (name),
          subs:sub_id (name)
        `);

      if (sortBy === 'trending') {
        // For trending: get posts with vote counts and recent activity
        // Posts from last 7 days, sorted by vote score + recent comments
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { data: trendingData } = await supabase
          .from('posts')
          .select(`
            *,
            users:user_id (username),
            categories:category_id (name),
            subs:sub_id (name)
          `)
          .gte('created_at', weekAgo.toISOString());

        if (trendingData) {
          // Get vote counts and recent activity for each post
          const postsWithScores = await Promise.all(
            trendingData.map(async (post) => {
              const [{ data: votes }, { count: recentComments }] = await Promise.all([
                supabase
                  .from('votes')
                  .select('vote_type')
                  .eq('post_id', post.id),
                supabase
                  .from('comments')
                  .select('*', { count: 'exact', head: true })
                  .eq('post_id', post.id)
                  .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
              ]);

              const voteScore = votes?.reduce((sum, vote) => sum + vote.vote_type, 0) || 0;
              const trendingScore = voteScore + (recentComments || 0) * 2; // Weight recent comments more

              return { ...post, trendingScore };
            })
          );

          // Sort by trending score
          postsWithScores.sort((a, b) => b.trendingScore - a.trendingScore);
          setPosts(postsWithScores);
        }
      } else {
        // Latest posts
        const { data } = await query.order('created_at', { ascending: false });
        setPosts(data || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    }
    
    setLoading(false);
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(searchLower) ||
      post.body.toLowerCase().includes(searchLower) ||
      post.categories?.name.toLowerCase().includes(searchLower) ||
      post.subs?.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Home Feed</h1>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Latest
                </div>
              </SelectItem>
              <SelectItem value="trending">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {searchQuery ? (
          <SearchResults searchQuery={searchQuery} />
        ) : loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No posts yet.</p>
            <Button 
              onClick={() => window.location.href = '/create'} 
              className="rounded-lg"
            >
              Create the first post!
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
