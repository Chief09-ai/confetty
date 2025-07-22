import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PostCard } from '@/components/PostCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Plus } from 'lucide-react';

export default function SubPosts() {
  const { subName } = useParams();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subName) {
      fetchSubAndPosts();
    }
  }, [subName]);

  const fetchSubAndPosts = async () => {
    setLoading(true);
    
    // Fetch sub details
    const { data: subData } = await supabase
      .from('subs')
      .select('*')
      .eq('name', subName)
      .single();
    
    setSub(subData);

    if (subData) {
      // Fetch posts for this sub
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          users:user_id (username),
          categories:category_id (name),
          subs:sub_id (name)
        `)
        .eq('sub_id', subData.id)
        .order('created_at', { ascending: false });

      setPosts(postsData || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="container max-w-4xl mx-auto px-4 py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Sub not found.</p>
              <Link to="/" className="text-primary hover:underline">
                Return to home
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-2xl">
                c/{sub.name}
              </CardTitle>
              {sub.description && (
                <p className="text-muted-foreground mt-2">{sub.description}</p>
              )}
            </div>
            {user && (
              <Link to={`/create?sub=${sub.name}`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </Link>
            )}
          </CardHeader>
        </Card>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No posts found in this sub.</p>
                {user && (
                  <Link to={`/create?sub=${sub.name}`}>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create the first post
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}