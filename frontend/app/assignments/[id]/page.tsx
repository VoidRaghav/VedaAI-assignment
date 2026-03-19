'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { assignmentApi } from '@/lib/api';
import { getSocket, connectSocket, joinAssignment, leaveAssignment } from '@/lib/socket';
import { Assignment, JobProgress, DifficultyLevel } from '@/types';
import { Download, Loader2 } from 'lucide-react';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<JobProgress | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadAssignment();
    connectSocket();

    const socket = getSocket();
    
    socket.on('connect', () => {
      joinAssignment(id);
    });

    socket.on('progress', (data: JobProgress) => {
      setProgress(data);
      if (data.status === 'completed') {
        loadAssignment();
      }
    });

    return () => {
      leaveAssignment(id);
      socket.off('progress');
    };
  }, [id]);

  const loadAssignment = async () => {
    try {
      const data = await assignmentApi.getById(id);
      setAssignment(data);
    } catch (error) {
      console.error('Failed to load assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!assignment) return;
    
    setDownloading(true);
    try {
      const blob = await assignmentApi.downloadPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${assignment.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      await assignmentApi.regenerate(id);
      setProgress({ status: 'pending', progress: 0, message: 'Starting regeneration...' });
    } catch (error) {
      console.error('Failed to regenerate:', error);
      alert('Failed to regenerate questions');
    }
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Assignment not found</h2>
          <Button onClick={() => router.push('/assignments')}>Go back</Button>
        </div>
      </div>
    );
  }

  const isGenerating = progress && (progress.status === 'pending' || progress.status === 'processing');
  const hasGenerated = assignment.generatedPaper && assignment.jobStatus === 'completed';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header title="Create New" showBack />
        
        <main className="py-6 px-4 sm:px-6 lg:px-8 pb-20 lg:pb-6">
          {isGenerating && (
            <Card className="p-6 mb-6 bg-gray-800 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold mb-1">
                    {assignment.title}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {progress.message || 'Generating question paper...'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white hover:bg-gray-700"
                  onClick={handleDownloadPDF}
                  disabled={!hasGenerated || downloading}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                ></div>
              </div>
            </Card>
          )}

          {hasGenerated ? (
            <Card className="p-8 bg-white">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 pb-6 border-b-2 border-black">
                  <h1 className="text-3xl font-bold mb-3">{assignment.title}</h1>
                  <div className="flex justify-center gap-8 text-sm">
                    <span>Total Marks: {assignment.generatedPaper?.totalMarks}</span>
                    <span>Total Questions: {assignment.generatedPaper?.totalQuestions}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Due Date: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8 p-4 border border-gray-300 rounded">
                  <div>
                    <label className="text-xs text-gray-500">Name:</label>
                    <div className="border-b border-black h-6"></div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Roll Number:</label>
                    <div className="border-b border-black h-6"></div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Section:</label>
                    <div className="border-b border-black h-6"></div>
                  </div>
                </div>

                {assignment.generatedPaper?.sections.map((section, sectionIdx) => (
                  <div key={sectionIdx} className="mb-8">
                    <div className="bg-gray-100 p-4 mb-4 border-l-4 border-black">
                      <h2 className="text-xl font-bold">{section.title}</h2>
                      <p className="text-sm text-gray-600 mt-1">{section.instruction}</p>
                    </div>

                    <div className="space-y-6">
                      {section.questions.map((question, qIdx) => (
                        <div key={qIdx} className="pl-4">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <p className="flex-1 text-base leading-relaxed">
                              <span className="font-semibold">Q{qIdx + 1}.</span> {question.text}
                            </p>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge
                                variant="outline"
                                className={`text-xs uppercase ${getDifficultyColor(question.difficulty)}`}
                              >
                                {question.difficulty}
                              </Badge>
                              <span className="text-sm font-semibold text-gray-600">
                                [{question.marks} marks]
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
                  <p>Generated by VedaAI Assessment Creator</p>
                </div>

                <div className="mt-8 flex justify-center gap-4">
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download as PDF
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleRegenerate}
                    variant="outline"
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="h-12 w-12 animate-spin mb-4" />
              <h2 className="text-xl font-semibold mb-2">Generating Question Paper</h2>
              <p className="text-gray-500">Please wait while AI creates your assessment...</p>
            </div>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
