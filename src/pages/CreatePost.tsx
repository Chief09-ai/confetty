import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    image_url: '',
    category_id: '',
    sub_id: ''
  });

  useEffect(() => {
    fetchCategoriesAndSubs();
    
    // Pre-select sub if coming from sub page
    const subName = searchParams.get('sub');
    if (subName) {
      // Find and set the sub
      supabase
        .from('subs')
        .select('id')
        .eq('name', subName)
        .single()
        .then(({ data }) => {
          if (data) {
            setFormData(prev => ({ ...prev, sub_id: data.id }));
          }
        });
    }
  }, [searchParams]);

  const fetchCategoriesAndSubs = async () => {
    // Fetch categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (categoriesData) {
      setCategories(categoriesData);
    }

    // Fetch subs
    const { data: subsData } = await supabase
      .from('subs')
      .select('*')
      .order('name');
    
    if (subsData) {
      setSubs(subsData);
    }
  };

  if (!user) {
    return <Navigate to="/auth?returnTo=/create" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          title: formData.title,
          body: formData.body || null,
          image_url: formData.image_url || null,
          category_id: formData.category_id || null,
          sub_id: formData.sub_id || null,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully!"
      });

      // Navigate to sub page if posting to a sub, otherwise home
      if (formData.sub_id) {
        const selectedSub = subs.find(s => s.id === formData.sub_id);
        if (selectedSub) {
          navigate(`/c/${selectedSub.name}`);
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Post</CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="What's on your mind?"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sub">Sub (Community)</Label>
                <Select value={formData.sub_id} onValueChange={(value) => setFormData({ ...formData, sub_id: value, category_id: '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sub (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {subs.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        c/{sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Don't see your community? <Link to="/create-sub" className="text-primary hover:underline">Create a new sub</Link>
                </p>
              </div>

              {!formData.sub_id && (
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="body">Content</Label>
                <Textarea
                  id="body"
                  name="body"
                  placeholder="Share your thoughts..."
                  value={formData.body}
                  onChange={handleInputChange}
                  rows={6}
                  className="rounded-lg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL (optional)</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="rounded-lg"
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  className="flex-1 rounded-lg"
                  disabled={loading || !formData.title.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Post'
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}