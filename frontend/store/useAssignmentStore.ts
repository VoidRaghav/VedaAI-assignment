import { create } from 'zustand';
import { Assignment, JobProgress } from '@/types';

interface AssignmentState {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  jobProgress: JobProgress | null;
  isLoading: boolean;
  error: string | null;
  setAssignments: (assignments: Assignment[]) => void;
  setCurrentAssignment: (assignment: Assignment | null) => void;
  setJobProgress: (progress: JobProgress | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  assignments: [],
  currentAssignment: null,
  jobProgress: null,
  isLoading: false,
  error: null,
  setAssignments: (assignments) => set({ assignments }),
  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),
  setJobProgress: (progress) => set({ jobProgress: progress }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  updateAssignment: (id, updates) =>
    set((state) => ({
      assignments: state.assignments.map((a) =>
        a._id === id ? { ...a, ...updates } : a
      ),
      currentAssignment:
        state.currentAssignment?._id === id
          ? { ...state.currentAssignment, ...updates }
          : state.currentAssignment,
    })),
}));
