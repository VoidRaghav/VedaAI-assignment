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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { assignmentApi } from '@/lib/api';
import { Assignment } from '@/types';
import { Search, MoreVertical, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    setDeletingId(id);
    try {
      await assignmentApi.delete(id);
      setAssignments(assignments.filter(a => a._id !== id));
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      alert('Failed to delete assignment');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewAssignment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/assignments/${id}`);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-[#E2E4E7] via-[#F3F4F6] to-[#F9FAFB]">
      <Sidebar />
      <div className="flex-1 lg:pl-64 min-h-screen">
        <div className="min-h-screen">
          <Header title="Assignments" subtitle="Manage and create assignments for your classes" />
          
          <main className="py-5 px-8 pb-20 lg:pb-6">

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <Button variant="outline" className="gap-2 h-10 px-4 text-[13px] font-outfit font-normal text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Filter By
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" strokeWidth={2} />
              <Input
                placeholder="Search Assignment"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-[13px] font-outfit bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
              />
            </div>
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
                  className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer rounded-2xl relative"
                  onClick={() => router.push(`/assignments/${assignment._id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-lexend font-bold text-[16px] text-[#1a1a1a] leading-tight">{assignment.title}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="h-5 w-5" strokeWidth={2} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={(e: any) => handleViewAssignment(assignment._id, e)}
                          className="cursor-pointer font-outfit text-[13px]"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View Assignment</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e: any) => handleDelete(assignment._id, e)}
                          className="cursor-pointer font-outfit text-[13px] text-red-600 focus:text-red-600"
                          disabled={deletingId === assignment._id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>{deletingId === assignment._id ? 'Deleting...' : 'Delete'}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-inter text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <span className="font-normal text-gray-600">Assigned on:</span>
                      <span className="text-gray-900">{format(new Date(assignment.createdAt), 'dd-MM-yyyy')}</span>
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1">
                      <span className="font-normal text-gray-600">Due:</span>
                      <span className="text-gray-900">{format(new Date(assignment.dueDate), 'dd-MM-yyyy')}</span>
                    </span>
                  </div>

                  {assignment.jobStatus === 'completed' && (
                    <div className="flex items-center gap-1.5 text-[12px] font-outfit font-medium text-[#059669]">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#059669]"></div>
                      <span>Question paper generated</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          <div className="fixed bottom-20 right-5 lg:bottom-6 lg:right-6">
            <Button
              onClick={() => router.push('/create')}
              className="h-14 w-14 rounded-full bg-[#1a1a1a] hover:bg-black text-white shadow-2xl flex items-center justify-center transition-all hover:scale-105"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </Button>
          </div>
        </main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
