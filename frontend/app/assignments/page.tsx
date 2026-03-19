'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import EmptyState from '@/components/EmptyState';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { assignmentApi } from '@/lib/api';
import { Assignment } from '@/types';
import { Search, Filter, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const data = await assignmentApi.getAll();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header title="Assignment" />
        
        <main className="py-6 px-4 sm:px-6 lg:px-8 pb-20 lg:pb-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <h1 className="text-2xl font-semibold">Assignments</h1>
            </div>
            <p className="text-sm text-gray-500">Manage and create assignments for your classes</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search Assignment"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter By
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAssignments.map((assignment) => (
                <Card
                  key={assignment._id}
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/assignments/${assignment._id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">{assignment.title}</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span>
                      <span className="font-medium">Assigned on:</span>{' '}
                      {format(new Date(assignment.createdAt), 'dd-MM-yyyy')}
                    </span>
                    <span>•</span>
                    <span>
                      <span className="font-medium">Due:</span>{' '}
                      {format(new Date(assignment.dueDate), 'dd-MM-yyyy')}
                    </span>
                  </div>

                  {assignment.jobStatus === 'completed' && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span>Question paper generated</span>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          <div className="fixed bottom-20 right-6 lg:bottom-6 lg:right-8">
            <Button
              onClick={() => router.push('/create')}
              className="h-14 w-14 rounded-full bg-black hover:bg-gray-800 text-white shadow-lg"
            >
              <span className="text-2xl">+</span>
            </Button>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
