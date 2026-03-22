'use client';

import { Bell, ChevronDown, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
}

export default function Header({ title, subtitle, showBack }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" strokeWidth={2} />
            </button>
          )}
          <div>
            {title && (
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-4 h-4 bg-[#10b981] rounded-full opacity-20 animate-ping"></div>
                  <div className="relative w-2 h-2 bg-[#10b981] rounded-full"></div>
                </div>
                <h1 className="text-[18px] font-lexend font-bold text-[#1a1a1a]">{title}</h1>
              </div>
            )}
            {subtitle && (
              <p className="mt-1 text-[12px] font-inter text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="relative hover:bg-gray-50 rounded-lg h-9 w-9 flex items-center justify-center">
            <Bell className="w-[18px] h-[18px] text-gray-600" strokeWidth={2} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#ef4444] rounded-full border border-white"></span>
          </button>

          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white font-semibold text-[13px]">
              RS
            </div>
            <div className="hidden md:block">
              <p className="text-[13px] font-outfit font-semibold text-[#1a1a1a]">RaghavS</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
          </div>
        </div>
      </div>
    </header>
  );
}
