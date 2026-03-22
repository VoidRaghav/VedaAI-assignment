'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, Layout, Library, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'My Groups', href: '/groups', icon: Users },
  { name: 'Assignments', href: '/assignments', icon: FileText, badge: 32 },
  { name: 'AI Teacher\'s Toolkit', href: '/toolkit', icon: Layout },
  { name: 'My Library', href: '/library', icon: Library },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:p-4">
      <div className="flex flex-col h-full bg-[#F8F9FA] border border-gray-200 rounded-3xl shadow-lg">
        <div className="flex items-center flex-shrink-0 px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#E45D25] p-1.5 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-2xl font-bold text-[#333]">VedaAI</span>
          </div>
        </div>

        <div className="px-4 mb-8">
          <Link
            href="/create"
            className="w-full bg-[#333] text-white py-3 rounded-full flex items-center justify-center gap-2 shadow-md hover:bg-black transition font-medium border-4 border-[#E45D25]"
          >
            <span className="text-lg">✦</span>
            Create Assignment
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl cursor-pointer transition font-medium',
                  isActive
                    ? 'bg-white shadow-sm text-[#333]'
                    : 'text-gray-500 hover:bg-gray-100'
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-[#FF7A45] text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex-shrink-0 p-4">
          <div className="border-t border-gray-200 pt-4">
            <Link
              href="/settings"
              className="flex items-center gap-2 text-gray-500 mb-4 px-2 cursor-pointer hover:text-gray-700 transition"
            >
              <Settings size={20} />
              <span>Settings</span>
            </Link>
            <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  R
                </div>
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold text-gray-800">RaghavS</p>
                <p className="text-[10px] text-gray-400">VoidRaghav</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
