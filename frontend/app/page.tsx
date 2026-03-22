'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { assignmentApi } from '@/lib/api';
import { Assignment } from '@/types';
import { FileText, Clock, CheckCircle, TrendingUp, Zap, BookOpen, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function Home() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

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

  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.jobStatus === 'completed').length;
  const totalQuestions = assignments.reduce((sum, a) => sum + (a.totalQuestions || 0), 0);
  const timeSaved = (totalAssignments * 0.5).toFixed(1);
  const recentAssignments = assignments.slice(0, 4);

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-[#E2E4E7] via-[#F3F4F6] to-[#F9FAFB]">
      <Sidebar />
      <main className="flex-1 lg:pl-64 p-8 overflow-y-auto">
        {/* Greeting Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Hi, Raghav Saxena!</h1>
              <p className="text-gray-500 text-lg">Welcome back. Here's your teaching summary.</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                R
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Assignments */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <FileText className="text-blue-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{totalAssignments}</h3>
            <p className="text-sm text-gray-500 font-medium">Total Assignments</p>
          </div>

          {/* Questions Generated */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                <BookOpen className="text-purple-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{totalQuestions}</h3>
            <p className="text-sm text-gray-500 font-medium">Questions Generated</p>
          </div>

          {/* Time Saved */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                <Zap className="text-orange-600" size={24} />
              </div>
              <Clock className="text-orange-500" size={20} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{timeSaved} hrs</h3>
            <p className="text-sm text-gray-500 font-medium">Time Saved by AI</p>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{completedAssignments}</h3>
            <p className="text-sm text-gray-500 font-medium">Papers Generated</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* AI Teacher's Toolkit */}
          <div className="bg-gradient-to-br from-[#E45D25] to-[#FF7A45] rounded-3xl p-8 text-white shadow-lg hover:shadow-xl transition">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">AI Teacher's Toolkit</h2>
              <p className="text-white/90 text-sm">Quickly create lesson plans, question papers, and curriculum-aligned teaching materials.</p>
            </div>
            <button 
              onClick={() => router.push('/toolkit')}
              className="bg-white text-[#E45D25] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition flex items-center gap-2"
            >
              Continue Now
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Weekly Progress */}
          <div className="bg-[#222] rounded-3xl p-8 text-white shadow-lg hover:shadow-xl transition">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Reviewed this week</h2>
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-40 h-40">
                  <svg className="transform -rotate-90 w-40 h-40">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#444"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#E45D25"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(completedAssignments / Math.max(totalAssignments, 1)) * 440} 440`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">{completedAssignments}</span>
                    <span className="text-sm text-gray-400">/ {totalAssignments}</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-400 mb-4">Assignments Completed</p>
            </div>
            <button 
              onClick={() => router.push('/assignments')}
              className="w-full bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
            >
              Continue to classroom
            </button>
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Assignments</h2>
            <button 
              onClick={() => router.push('/assignments')}
              className="text-[#E45D25] font-semibold hover:text-[#d54d1a] transition flex items-center gap-2"
            >
              View All
              <ArrowRight size={18} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E45D25]"></div>
            </div>
          ) : recentAssignments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
              <FileText className="mx-auto mb-4 text-gray-300" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No assignments yet</h3>
              <p className="text-gray-500 mb-6">Create your first assignment to get started</p>
              <button 
                onClick={() => router.push('/create')}
                className="bg-[#333] text-white px-6 py-3 rounded-full font-semibold hover:bg-black transition"
              >
                Create Assignment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentAssignments.map((assignment) => (
                <div
                  key={assignment._id}
                  onClick={() => router.push(`/assignments/${assignment._id}`)}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-300 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900">{assignment.title}</h3>
                    {assignment.jobStatus === 'completed' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Completed</span>
                    ) : (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">Draft</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>Assigned: {format(new Date(assignment.createdAt), 'dd-MM-yyyy')}</span>
                    <span>•</span>
                    <span>Due: {format(new Date(assignment.dueDate), 'dd-MM-yyyy')}</span>
                  </div>
                  {assignment.jobStatus === 'completed' && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                      <span className="font-medium">Question paper generated</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
