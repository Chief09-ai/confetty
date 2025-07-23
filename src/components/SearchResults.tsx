import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PostCard } from '@/components/PostCard';
import { supabase } from '@/integrations/supabase/client';
import { Search } from 'lucide-react';

interface SearchResultsProps {
  searchQuery: string;
}

export function SearchResults({ searchQuery }: SearchResultsProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setPosts([]);
      setSubs([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    setLoading(true);
    
    try {
      // Search posts
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          users:user_id (username),
          categories:category_id (name),
          subs:sub_id (name)
        `)
        .or(`title.ilike.%${searchQuery}%,body.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false });

      // Search subs
      const { data: subsData } = await supabase
        .from('subs')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

      setPosts(postsData || []);
      setSubs(subsData || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!searchQuery.trim()) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Search className="h-8 w-8 animate-pulse mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">Searching...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {subs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Communities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {subs.map((sub) => (
                <Link key={sub.id} to={`/c/${sub.name}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    c/{sub.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {posts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Posts ({posts.length})</h3>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {posts.length === 0 && subs.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}