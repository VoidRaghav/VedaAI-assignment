'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { assignmentApi } from '@/lib/api';
import { getSocket, connectSocket, joinAssignment, leaveAssignment } from '@/lib/socket';
import { Assignment, JobProgress } from '@/types';
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
  }, [id]);

  useEffect(() => {
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

  useEffect(() => {
    if (assignment?.jobStatus === 'processing' || assignment?.jobStatus === 'pending') {
      const pollInterval = setInterval(() => {
        loadAssignment();
      }, 2000);

      return () => clearInterval(pollInterval);
    }
  }, [assignment?.jobStatus]);

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


  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#E5E5E5]">
        <Sidebar />
        <main className="flex-1 lg:ml-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex min-h-screen bg-[#E5E5E5]">
        <Sidebar />
        <main className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Assignment not found</h2>
            <button 
              onClick={() => router.push('/assignments')}
              className="px-4 py-2 bg-[#333] text-white rounded-lg hover:bg-black transition"
            >
              Go back
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isGenerating = progress && (progress.status === 'pending' || progress.status === 'processing');
  const hasGenerated = assignment.generatedPaper && assignment.jobStatus === 'completed';

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-[#E2E4E7] via-[#F3F4F6] to-[#F9FAFB]">
      <Sidebar />
      <main className="flex-1 lg:pl-64 p-8 overflow-y-auto">
        {isGenerating && (
          <div className="bg-[#222] rounded-3xl p-8 mb-6 text-white relative overflow-hidden">
            <p className="text-lg mb-4 leading-relaxed">
              Generating your customized <span className="underline decoration-2">Question Paper</span> for {(assignment as any).subject || 'the subject'} - Class {(assignment as any).class || 'Standard'}...
            </p>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-300">{progress.message || 'Please wait...'}</p>
          </div>
        )}

        {hasGenerated ? (
          <div>
            <div className="bg-[#222] rounded-3xl p-8 mb-6 text-white relative overflow-hidden">
              <p className="text-lg mb-4 leading-relaxed">
                Certainly! Here is your customized <span className="underline decoration-2">Question Paper</span> for {(assignment as any).subject || 'the subject'} - Class {(assignment as any).class || 'Standard'}:
              </p>
              <button 
                onClick={handleDownloadPDF}
                disabled={!hasGenerated || downloading}
                className="bg-white text-black px-6 py-2 rounded-full flex items-center gap-2 font-medium hover:bg-gray-200 transition disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Downloading...
                  </>
                ) : (
                  <>
                    <Download size={18} /> Download as PDF
                  </>
                )}
              </button>
            </div>
            <div className="max-w-4xl mx-auto bg-white rounded-[40px] shadow-xl p-12 min-h-[1000px]">
              <header className="text-center mb-10">
                <h1 className="text-3xl font-extrabold text-[#333]">Delhi Public School, Sector-4, Bokaro</h1>
                <h2 className="text-xl font-semibold mt-2">Subject: {(assignment as any).subject || 'General'}</h2>
                <p className="text-lg font-medium">Class: {(assignment as any).class || 'Standard'}</p>
              </header>

              <div className="flex justify-between font-bold mb-4">
                <span>Time Allowed: {(assignment as any).duration || '45'} minutes</span>
                <span>Maximum Marks: {assignment.generatedPaper?.totalMarks}</span>
              </div>
              <p className="italic mb-8">All questions are compulsory unless stated otherwise.</p>

              <div className="space-y-2 mb-12">
                <p><strong>Name:</strong> _________________________</p>
                <p><strong>Roll Number:</strong> __________________</p>
                <p><strong>Class: {(assignment as any).class || 'Standard'} Section:</strong> ___________</p>
              </div>

              {assignment.generatedPaper?.sections.map((section, sectionIdx) => {
                let questionCounter = 1;
                if (sectionIdx > 0) {
                  for (let i = 0; i < sectionIdx; i++) {
                    questionCounter += assignment.generatedPaper?.sections[i].questions.length || 0;
                  }
                }

                return (
                  <div key={sectionIdx} className="mb-10">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold border-b-2 border-black inline-block px-4 pb-1">
                        {section.title}
                      </h2>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-bold text-lg">{section.instruction}</h3>
                    </div>

                    <ol className="list-decimal pl-5 space-y-6">
                      {section.questions.map((question, qIdx) => {
                        const currentNum = questionCounter + qIdx;
                        return (
                          <li key={qIdx} className="text-base">
                            {question.text} <span className="font-semibold">[{question.marks} Marks]</span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })}

              {assignment.generatedPaper?.sections && assignment.generatedPaper.sections.length > 0 && (
                <div className="mt-12 pt-8 border-t-2 border-gray-300">
                  <h2 className="text-2xl font-bold text-center mb-6 underline">Answer Key</h2>
                  <ol className="list-decimal pl-5 space-y-4">
                    {(() => {
                      return assignment.generatedPaper.sections.flatMap((section) =>
                        section.questions.map((q, qIdx) => {
                          const answer = (q as any).answer || 'Answer not provided';
                          return (
                            <li key={`${section.title}-${qIdx}`} className="text-base">
                              {answer}
                            </li>
                          );
                        })
                      );
                    })()}
                  </ol>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <h2 className="text-xl font-semibold mb-2">Generating Question Paper</h2>
            <p className="text-gray-500">Please wait while AI creates your assessment...</p>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
