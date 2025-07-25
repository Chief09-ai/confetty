import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Mail, User, Trophy } from 'lucide-react';

export default function Account() {
  const { user, userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <User className="h-6 w-6" />
              My Account
            </CardTitle>
            <CardDescription>
              Your profile information and account details
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Username
                </label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    u/{userProfile?.username || 'Loading...'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <p className="text-foreground font-medium">
                  {user.email}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </label>
                <p className="text-foreground font-medium">
                  {userProfile?.joined_at ? formatDate(userProfile.joined_at) : 'Loading...'}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Account Status
                </label>
                <Badge variant="default" className="w-fit">
                  {user.email_confirmed_at ? 'Verified' : 'Pending Verification'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Confetty Score
                </label>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={userProfile?.confetty_score >= 0 ? "default" : "destructive"} 
                    className="text-lg px-3 py-1 font-bold"
                  >
                    {userProfile?.confetty_score || 0}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {userProfile?.confetty_score > 0 ? "🎉" : userProfile?.confetty_score < 0 ? "😔" : "🎯"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Earned from upvotes on your posts and comments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}