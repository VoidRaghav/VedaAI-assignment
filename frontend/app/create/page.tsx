'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { assignmentApi } from '@/lib/api';
import { QuestionType } from '@/types';
import { Upload, Calendar, X, Plus } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header title="Assignment" showBack />
        
        <main className="py-6 px-4 sm:px-6 lg:px-8 pb-20 lg:pb-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <h1 className="text-2xl font-semibold">Create Assignment</h1>
            </div>
            <p className="text-sm text-gray-500">Set up a new assignment for your students</p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
            <div className="bg-black h-2 rounded-full" style={{ width: '50%' }}></div>
          </div>

          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Assignment Details</h2>
            <p className="text-sm text-gray-500 mb-6">Basic information about your assignment</p>

            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium mb-1">Choose a file or drag & drop it here</p>
                <p className="text-xs text-gray-500 mb-3">JPEG, PNG, upto 10MB</p>
                <Button variant="outline" size="sm">Browse Files</Button>
                <p className="text-xs text-gray-400 mt-3">Upload images of your preferred document/image</p>
              </div>

              <div>
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Quiz on Electricity"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <div className="relative mt-1">
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Question Type</Label>
                  <div className="flex gap-4 text-sm font-medium">
                    <span>No. of Questions</span>
                    <span>Marks</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {questionRows.map((row) => (
                    <div key={row.id} className="flex items-center gap-3">
                      <select
                        value={row.type}
                        onChange={(e) => updateQuestionRow(row.id, 'type', e.target.value as QuestionType)}
                        className="flex-1 h-10 rounded-md border border-gray-300 px-3 text-sm"
                      >
                        {questionTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      
                      <button
                        onClick={() => removeQuestionType(row.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>

                      <Input
                        type="number"
                        min="1"
                        value={row.questions}
                        onChange={(e) => updateQuestionRow(row.id, 'questions', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />

                      <Input
                        type="number"
                        min="1"
                        value={row.marks}
                        onChange={(e) => updateQuestionRow(row.id, 'marks', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={addQuestionType}
                  className="mt-3 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Question Type
                </Button>

                <div className="mt-4 pt-4 border-t text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Questions: {totalQuestions}</span>
                    <span className="font-medium">Total Marks: {totalMarks}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="additionalInfo">Additional Information (For better output)</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="e.g Generate a question paper for 3 hour exam duration..."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Previous
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {loading ? 'Creating...' : 'Next'}
            </Button>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
