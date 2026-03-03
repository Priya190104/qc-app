'use client';

import React from 'react';
import Sidebar from './Navbar';
import { useLayoutStore } from '@/stores/layoutStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { sidebarCollapsed } = useLayoutStore();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content - Responsive */}
      <main
        className={`flex-1 transition-all duration-300 p-8 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

