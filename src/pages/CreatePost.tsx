import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    image_url: '',
    category_id: ''
  });

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    setCategories(data || []);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
          body: formData.body,
          image_url: formData.image_url || null,
          category_id: formData.category_id,
          user_id: user.id,
          created_at: new Date().toISOString()
        });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: "Your post has been created.",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
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
                <Label htmlFor="category_id">Category *</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  required
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Choose a category" />
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
              
              <div className="space-y-2">
                <Label htmlFor="body">Content *</Label>
                <Textarea
                  id="body"
                  name="body"
                  placeholder="Share your thoughts..."
                  value={formData.body}
                  onChange={handleInputChange}
                  required
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
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Post'}
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