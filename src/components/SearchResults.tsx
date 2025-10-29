import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PostCard } from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/PostCardSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { Search } from 'lucide-react';
import { SearchFilters, type SearchFilters as SearchFiltersType } from './SearchFilters';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResultsProps {
  searchQuery: string;
}

export function SearchResults({ searchQuery }: SearchResultsProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      performSearch();
    } else {
      setPosts([]);
      setSubs([]);
    }
  }, [debouncedSearch, filters]);

  const performSearch = async () => {
    setLoading(true);
    
    try {
      // Build posts query
      let postsQuery = supabase
        .from('posts')
        .select(`
          *,
          users:user_id (username),
          categories:category_id (name),
          subs:sub_id (name)
        `)
        .or(`title.ilike.%${debouncedSearch}%,body.ilike.%${debouncedSearch}%`);

      // Apply filters
      if (filters.category) {
        postsQuery = postsQuery.eq('category_id', filters.category);
      }
      if (filters.sub) {
        postsQuery = postsQuery.eq('sub_id', filters.sub);
      }
      if (filters.dateRange) {
        const date = new Date();
        if (filters.dateRange === 'today') {
          date.setHours(0, 0, 0, 0);
        } else if (filters.dateRange === 'week') {
          date.setDate(date.getDate() - 7);
        } else if (filters.dateRange === 'month') {
          date.setMonth(date.getMonth() - 1);
        } else if (filters.dateRange === 'year') {
          date.setFullYear(date.getFullYear() - 1);
        }
        if (filters.dateRange !== 'all') {
          postsQuery = postsQuery.gte('created_at', date.toISOString());
        }
      }

      // Apply sorting
      if (filters.sortBy === 'latest' || !filters.sortBy) {
        postsQuery = postsQuery.order('created_at', { ascending: false });
      }

      const { data: postsData } = await postsQuery;

      // Apply additional sorting if needed (for top/comments, we need to fetch additional data)
      let finalPosts: any[] = postsData || [];
      if (filters.sortBy === 'top' || filters.sortBy === 'comments') {
        const postsWithStats = await Promise.all(
          finalPosts.map(async (post: any) => {
            if (filters.sortBy === 'top') {
              const { data: votes } = await supabase
                .from('votes')
                .select('vote_type')
                .eq('post_id', post.id);
              const score = votes?.reduce((sum, v) => sum + v.vote_type, 0) || 0;
              return { ...post, score };
            } else {
              const { count } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', post.id);
              return { ...post, commentCount: count || 0 };
            }
          })
        );
        finalPosts = postsWithStats.sort((a: any, b: any) => {
          if (filters.sortBy === 'top') {
            return (b.score || 0) - (a.score || 0);
          }
          return (b.commentCount || 0) - (a.commentCount || 0);
        });
      }

      // Search subs (only when not using filters)
      let subsData = [];
      if (!filters.category && !filters.sub) {
        const { data } = await supabase
          .from('subs')
          .select('*')
          .or(`name.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`);
        subsData = data || [];
      }

      setPosts(finalPosts);
      setSubs(subsData);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!searchQuery.trim()) {
    return null;
  }

  return (
    <div className="space-y-6">
      <SearchFilters onFilterChange={setFilters} />

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
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
              <p className="text-muted-foreground">No results found for "{debouncedSearch}"</p>
            </CardContent>
          </Card>
        )}
      </>
      )}
    </div>
  );
}