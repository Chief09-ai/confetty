import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Flag, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function Reports() {
  const { isModerator, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (!roleLoading && !isModerator) {
      toast.error('Access denied: Moderator privileges required');
      navigate('/');
    }
  }, [isModerator, roleLoading, navigate]);

  useEffect(() => {
    if (isModerator) {
      fetchReports();
    }
  }, [isModerator, activeTab]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('reported_content')
        .select(`
          *,
          reporter:reporter_id (username),
          post:post_id (id, title),
          comment:comment_id (id, body)
        `)
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reported_content')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', reportId);

      if (error) throw error;

      toast.success(`Report ${status}`);
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery="" onSearchChange={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isModerator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery="" onSearchChange={() => {}} />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Flag className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Content Reports</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
            <TabsTrigger value="actioned">Actioned</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-12">Loading reports...</div>
            ) : reports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No {activeTab} reports</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {report.post_id ? 'Post Report' : 'Comment Report'}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Reported by u/{report.reporter?.username}</span>
                            <span>•</span>
                            <span>{new Date(report.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge variant={report.status === 'pending' ? 'default' : 'secondary'}>
                          {report.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="font-medium mb-1">Reason: {report.reason}</p>
                        {report.details && (
                          <p className="text-sm text-muted-foreground">{report.details}</p>
                        )}
                      </div>

                      {report.post && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Reported Post:</p>
                          <Link
                            to={`/post/${report.post.id}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {report.post.title}
                          </Link>
                        </div>
                      )}

                      {report.comment && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Reported Comment:</p>
                          <p className="text-sm">{report.comment.body.substring(0, 200)}...</p>
                        </div>
                      )}

                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateReportStatus(report.id, 'dismissed')}
                            className="gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Dismiss
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateReportStatus(report.id, 'actioned')}
                            className="gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Take Action
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateReportStatus(report.id, 'reviewed')}
                          >
                            Mark Reviewed
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}