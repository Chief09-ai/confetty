import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PostCard } from '@/components/PostCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function CategoryPosts() {
  const { categoryId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryAndPosts();
    }
  }, [categoryId]);

  const fetchCategoryAndPosts = async () => {
    setLoading(true);
    
    // Fetch category details
    const { data: categoryData } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();
    
    setCategory(categoryData);

    // Fetch posts for this category
    const { data: postsData } = await supabase
      .from('posts')
      .select(`
        *,
        users:user_id (username),
        categories:category_id (name),
        subs:sub_id (name)
      `)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    setPosts(postsData || []);
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

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">
              {category?.name || 'Category'}
            </CardTitle>
            {category?.description && (
              <p className="text-muted-foreground">{category.description}</p>
            )}
          </CardHeader>
        </Card>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No posts found in this category.</p>
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