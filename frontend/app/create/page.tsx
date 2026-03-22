'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { assignmentApi } from '@/lib/api';
import { QuestionType } from '@/types';
import { Upload, X, Plus, Minus, Bell, Loader2 } from 'lucide-react';

interface QuestionTypeRow {
  id: string;
  type: QuestionType;
  label: string;
  questions: number;
  marks: number;
}

const questionTypeOptions: { value: QuestionType; label: string }[] = [
  { value: 'mcq', label: 'Multiple Choice Questions' },
  { value: 'short', label: 'Short Questions' },
  { value: 'long', label: 'Diagram/Graph-Based Questions' },
  { value: 'true-false', label: 'Numerical Problems' },
];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [duration, setDuration] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [questionRows, setQuestionRows] = useState<QuestionTypeRow[]>([
    { id: '1', type: 'mcq', label: 'Multiple Choice Questions', questions: 4, marks: 1 },
    { id: '2', type: 'short', label: 'Short Questions', questions: 3, marks: 2 },
    { id: '3', type: 'long', label: 'Diagram/Graph-Based Questions', questions: 5, marks: 5 },
    { id: '4', type: 'true-false', label: 'Numerical Problems', questions: 5, marks: 5 },
  ]);

  const totalQuestions = questionRows.reduce((sum, row) => sum + row.questions, 0);
  const totalMarks = questionRows.reduce((sum, row) => sum + (row.questions * row.marks), 0);

  const addQuestionType = () => {
    const newRow: QuestionTypeRow = {
      id: Date.now().toString(),
      type: 'mcq',
      label: 'Multiple Choice Questions',
      questions: 1,
      marks: 1,
    };
    setQuestionRows([...questionRows, newRow]);
  };

  const removeQuestionType = (id: string) => {
    setQuestionRows(questionRows.filter((row) => row.id !== id));
  };

  const updateQuestionRow = (id: string, field: keyof QuestionTypeRow, value: any) => {
    setQuestionRows(
      questionRows.map((row) => {
        if (row.id === id) {
          if (field === 'type') {
            const option = questionTypeOptions.find((opt) => opt.value === value);
            return { ...row, type: value, label: option?.label || '' };
          }
          return { ...row, [field]: value };
        }
        return row;
      })
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setUploading(true);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('http://localhost:5001/api/assignments/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        const data = await response.json();
        setExtractedText(data.data.extractedText || '');
        
        if (data.data.extractedText) {
          setAdditionalInfo(prev => 
            prev ? `${prev}\n\nExtracted from document:\n${data.data.extractedText}` 
            : `Use this content as reference:\n${data.data.extractedText}`
          );
        }
      } catch (error) {
        console.error('File upload failed:', error);
        alert('Failed to process file. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!title || !dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const questionTypes = questionRows.map((row) => row.type);
      
      const assignment = await assignmentApi.create({
        title,
        subject,
        class: className,
        duration,
        dueDate,
        questionTypes,
        totalQuestions,
        totalMarks,
        additionalInstructions: additionalInfo,
      });

      await assignmentApi.generate(assignment._id);
      router.push(`/assignments/${assignment._id}`);
    } catch (error) {
      console.error('Failed to create assignment:', error);
      alert('Failed to create assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-[#E2E4E7] via-[#F3F4F6] to-[#F9FAFB]">
      <Sidebar />
      <main className="flex-1 lg:pl-64 p-8 bg-gradient-to-r from-[#E2E4E7] via-[#F3F4F6] to-[#F9FAFB]">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 text-gray-400">
            <button 
              onClick={() => router.back()}
              className="hover:text-gray-600 cursor-pointer"
            >
              ← Assignments
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="text-gray-400" size={20} />
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                U
              </div>
              <span className="font-medium text-sm">User</span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-4 h-4 rounded-full bg-green-500 border-4 border-green-100"></div>
            <div>
              <h1 className="text-xl font-bold">Create Assignment</h1>
              <p className="text-gray-400 text-sm">Set up a new assignment for your students</p>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
            <h2 className="font-bold mb-2">Assignment Details</h2>
            <p className="text-xs text-gray-400 mb-6">Basic information about your assignment</p>

            <div className="space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-bold mb-2">Assignment Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Biology Test - Chapter 5"
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E45D25]" 
                />
              </div>

              {/* Subject, Class, Duration Row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Subject</label>
                  <input 
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Biology"
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E45D25]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Class</label>
                  <input 
                    type="text" 
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="10th"
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E45D25]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Duration (min)</label>
                  <input 
                    type="text" 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="45"
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E45D25]" 
                  />
                </div>
              </div>

              {/* Dropzone */}
              <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-[#FAFAFA] relative">
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-3xl">
                    <Loader2 className="h-8 w-8 animate-spin text-[#E45D25]" />
                  </div>
                )}
                <div className="bg-white p-3 rounded-full shadow-sm mb-4">
                  <Upload className="text-gray-400" size={24} />
                </div>
                <p className="font-medium">
                  {uploadedFile ? uploadedFile.name : 'Choose a file or drag & drop it here'}
                </p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, PDF up to 10MB</p>
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*,application/pdf"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label 
                  htmlFor="file-upload"
                  className="mt-4 px-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50"
                >
                  Browse Files
                </label>
                {extractedText && (
                  <p className="text-xs text-green-600 mt-2">✓ Text extracted successfully</p>
                )}
              </div>

              <p className="text-center text-xs text-gray-400">Upload images of your preferred document for AI to extract content</p>

              <div>
                <label className="block text-sm font-bold mb-2">Due Date</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E45D25]" 
                />
              </div>

              {/* Question Type Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <span className="flex-1">Question Type</span>
                  <span className="w-24 text-center">No. of Questions</span>
                  <span className="w-20 text-center">Marks</span>
                </div>

                {questionRows.map((row) => (
                  <div key={row.id} className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-50 px-4 py-2.5 rounded-full border border-gray-200 text-sm">
                      <select
                        value={row.type}
                        onChange={(e) => updateQuestionRow(row.id, 'type', e.target.value as QuestionType)}
                        className="bg-transparent border-none outline-none w-full font-medium text-gray-700"
                      >
                        {questionTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={() => removeQuestionType(row.id)}
                      className="p-1 hover:bg-gray-200 rounded-full transition"
                    >
                      <X size={16} className="text-gray-400 hover:text-red-500" />
                    </button>
                    <div className="w-24 flex items-center justify-center gap-1 bg-gray-50 py-2 px-2 rounded-full border border-gray-200">
                      <button 
                        onClick={() => updateQuestionRow(row.id, 'questions', Math.max(0, row.questions - 1))}
                        className="p-0.5 hover:bg-gray-200 rounded-full transition"
                      >
                        <Minus size={12} className="text-gray-500" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center text-gray-700">{row.questions}</span>
                      <button 
                        onClick={() => updateQuestionRow(row.id, 'questions', row.questions + 1)}
                        className="p-0.5 hover:bg-gray-200 rounded-full transition"
                      >
                        <Plus size={12} className="text-gray-500" />
                      </button>
                    </div>
                    <div className="w-20 flex items-center justify-center gap-1 bg-gray-50 py-2 px-2 rounded-full border border-gray-200">
                      <button 
                        onClick={() => updateQuestionRow(row.id, 'marks', Math.max(0, row.marks - 1))}
                        className="p-0.5 hover:bg-gray-200 rounded-full transition"
                      >
                        <Minus size={12} className="text-gray-500" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center text-gray-700">{row.marks}</span>
                      <button 
                        onClick={() => updateQuestionRow(row.id, 'marks', row.marks + 1)}
                        className="p-0.5 hover:bg-gray-200 rounded-full transition"
                      >
                        <Plus size={12} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Add Question Type Button */}
                <button
                  onClick={addQuestionType}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition mt-2"
                >
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <Plus size={14} className="text-white" />
                  </div>
                  Add Question Type
                </button>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-end gap-8 text-sm font-bold text-gray-700">
                    <span>Total Questions : {totalQuestions}</span>
                    <span>Total Marks : {totalMarks}</span>
                  </div>
                </div>
              </div>

              {/* Additional Instructions */}
              <div>
                <label className="block text-sm font-bold mb-2">Additional Instructions (Optional)</label>
                <textarea 
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Any specific instructions for the AI..."
                  rows={4}
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E45D25]"
                />
              </div>

            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 max-w-3xl mx-auto">
            <button 
              onClick={() => router.back()}
              className="px-8 py-3 bg-white text-gray-700 rounded-full font-medium hover:bg-gray-100 transition border border-gray-200 flex items-center gap-2"
            >
              <span>←</span>
              Previous
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-[#333] text-white rounded-full font-medium hover:bg-black transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Next
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
