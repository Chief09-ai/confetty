import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function CreateSub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Sub name is required",
        variant: "destructive"
      });
      return;
    }

    // Validate sub name (alphanumeric and underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(formData.name)) {
      toast({
        title: "Error",
        description: "Sub name can only contain letters, numbers, and underscores",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('subs')
        .insert({
          name: formData.name.toLowerCase(),
          description: formData.description || null,
          creator_id: user.id
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Error",
            description: "A sub with this name already exists",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Success",
        description: "Sub created successfully!"
      });

      navigate(`/c/${data.name}`);
    } catch (error) {
      console.error('Error creating sub:', error);
      toast({
        title: "Error",
        description: "Failed to create sub. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Create a Sub</CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Sub Name *</Label>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-1">c/</span>
                  <Input
                    id="name"
                    placeholder="mysub"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="flex-1"
                    disabled={loading}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Use letters, numbers, and underscores only. Cannot be changed later.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is your sub about?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !formData.name.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Sub...
                  </>
                ) : (
                  'Create Sub'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}