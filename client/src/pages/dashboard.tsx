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
import { Loader2, BookOpen, Users, CheckSquare, BookPlus, Award } from 'lucide-react';
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, <span className="font-medium">{user?.name}</span>
            </p>
          </div>
          <Button 
            onClick={handleCreateTest} 
            className="mt-4 sm:mt-0 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 shadow-md transition-all duration-200 transform hover:scale-105"
          >
            <BookPlus className="mr-2 h-4 w-4" />
            Create New Test
          </Button>
        </div>
        
        {isLoadingStats ? (
          <div className="flex justify-center p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard 
              title="Total Students" 
              value={stats?.totalStudents || 0}
              change={stats?.totalStudents > 0 ? { value: 5, isPositive: true } : undefined}
              icon={<Users className="h-5 w-5 text-blue-600" />}
              iconBgColor="bg-blue-100"
            />
            <StatsCard 
              title="Pending Approvals" 
              value={stats?.pendingApprovals || 0}
              icon={<CheckSquare className="h-5 w-5 text-yellow-600" />}
              iconBgColor="bg-yellow-100"
            />
            <StatsCard 
              title="Tests Created" 
              value={stats?.testsCreated || 0}
              change={stats?.testsCreated > 0 ? { value: 12, isPositive: true } : undefined}
              icon={<BookOpen className="h-5 w-5 text-green-600" />}
              iconBgColor="bg-green-100"
            />
            <StatsCard 
              title="Tests Assigned" 
              value={stats?.testsAssigned || 0}
              icon={<Award className="h-5 w-5 text-purple-600" />}
              iconBgColor="bg-purple-100"
            />
          </div>
        )}
        
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="bg-white border border-gray-200 shadow-sm p-1">
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm">
              Pending Approvals {pendingStudents.length > 0 && <span className="ml-1.5 bg-primary/20 px-2 py-0.5 rounded-full text-xs font-medium">{pendingStudents.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm">
              Recent Activity
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="space-y-4">
            <Card className="border border-gray-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100 pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800">Student Approval Requests</CardTitle>
                <CardDescription className="text-gray-600">
                  Approve or reject student requests to join your class
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 bg-white">
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
            <Card className="border border-gray-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100 pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800">Recent Activity</CardTitle>
                <CardDescription className="text-gray-600">
                  Your recent tests and assignments
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 bg-white">
                <div className="text-gray-500 text-center py-12 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No recent activity to display</p>
                  <p className="text-xs mt-1">Create and assign tests to see activity here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}