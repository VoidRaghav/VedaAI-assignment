'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header title="My Library" />
        <main className="py-6 px-4 sm:px-6 lg:px-8 pb-20 lg:pb-6">
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-2">My Library</h2>
            <p className="text-gray-500">Coming soon...</p>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
