import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDashboardStats, usePendingStudents } from '@/hooks/use-test-data';
import { useAuth } from '@/hooks/use-auth';
import Layout from '@/components/Layout';
import StatsCard from '@/components/StatsCard';
import StudentApprovalTable from '@/components/StudentApprovalTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BookOpen, Users, CheckSquare, BookPlus } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useDashboardStats();
  const { data: pendingData, isLoading: isLoadingPending } = usePendingStudents();
  
  const pendingStudents = pendingData?.pendingStudents || [];
  
  useEffect(() => {
    if (statsError) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  }, [statsError, toast]);
  
  const handleCreateTest = () => {
    navigate('/create-test');
  };
  
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}
            </p>
          </div>
          <Button onClick={handleCreateTest}>
            <BookPlus className="mr-2 h-4 w-4" />
            Create New Test
          </Button>
        </div>
        
        {isLoadingStats ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard 
              title="Total Students" 
              value={stats?.totalStudents || 0}
              icon={<Users className="h-4 w-4 text-blue-600" />}
              iconBgColor="bg-blue-100"
            />
            <StatsCard 
              title="Pending Approvals" 
              value={stats?.pendingApprovals || 0}
              icon={<CheckSquare className="h-4 w-4 text-yellow-600" />}
              iconBgColor="bg-yellow-100"
            />
            <StatsCard 
              title="Tests Created" 
              value={stats?.testsCreated || 0}
              icon={<BookOpen className="h-4 w-4 text-green-600" />}
              iconBgColor="bg-green-100"
            />
            <StatsCard 
              title="Tests Assigned" 
              value={stats?.testsAssigned || 0}
              icon={<Users className="h-4 w-4 text-purple-600" />}
              iconBgColor="bg-purple-100"
            />
          </div>
        )}
        
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Approvals {pendingStudents.length > 0 && `(${pendingStudents.length})`}
            </TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Approval Requests</CardTitle>
                <CardDescription>
                  Approve or reject student requests to join your class
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPending ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <StudentApprovalTable />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent tests and assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  No recent activity to display
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}