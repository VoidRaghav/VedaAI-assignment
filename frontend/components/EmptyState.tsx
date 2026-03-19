import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="relative w-48 h-48 mb-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-20 h-20 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        <svg className="absolute top-0 left-0 w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div className="absolute top-4 right-0 w-16 h-4 bg-gray-200 rounded"></div>
        <div className="absolute top-8 right-2 w-8 h-8 rounded-full bg-blue-200"></div>
        <div className="absolute bottom-8 left-4 w-6 h-6 text-blue-400">✨</div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2">No assignments yet</h2>
      <p className="text-sm text-gray-500 text-center max-w-md mb-6">
        Create your first assignment to start collecting and grading student submissions. 
        You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>

      <Link href="/create">
        <Button className="bg-black hover:bg-gray-800 text-white rounded-full px-6">
          <span className="mr-2">+</span>
          Create Your First Assignment
        </Button>
      </Link>
    </div>
  );
}
