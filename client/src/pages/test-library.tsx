import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTests } from '@/hooks/use-test-data';
import Layout from '@/components/Layout';
import TestTable from '@/components/TestTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, BookPlus, Search } from 'lucide-react';

export default function TestLibrary() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterType, setFilterType] = useState('');
  
  const { data, isLoading, error } = useTests();
  
  // Filter tests based on search term and filters
  const filteredTests = data?.tests.filter(test => {
    const matchesSearch = searchTerm === '' || 
      test.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = filterSubject === '' || 
      test.subject === filterSubject;
    
    const matchesType = filterType === '' || 
      test.type === filterType;
    
    return matchesSearch && matchesSubject && matchesType;
  }) || [];
  
  const handleCreateTest = () => {
    navigate('/create-test');
  };
  
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Test Library</h1>
            <p className="text-muted-foreground">
              Manage your tests and assessments
            </p>
          </div>
          <Button onClick={handleCreateTest}>
            <BookPlus className="mr-2 h-4 w-4" />
            Create New Test
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Tests</CardTitle>
            <CardDescription>
              View and manage all your created tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tests..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 flex-col sm:flex-row sm:w-auto w-full">
                  <Select 
                    value={filterSubject} 
                    onValueChange={setFilterSubject}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Subjects</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="social_science">Social Science</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={filterType} 
                    onValueChange={setFilterType}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="chapter_test">Chapter Test</SelectItem>
                      <SelectItem value="mock_test">Mock Test</SelectItem>
                      <SelectItem value="board_pattern">Board Pattern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="p-8 text-center text-muted-foreground">
                  Error loading tests. Please try again.
                </div>
              ) : (
                <TestTable 
                  tests={filteredTests} 
                  isLoading={isLoading} 
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}