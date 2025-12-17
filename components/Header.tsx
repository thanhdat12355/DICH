import React from 'react';
import { Languages } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Languages className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Viet-Ger Visual Translator</h1>
        </div>
        <div className="text-sm text-gray-500 font-medium hidden sm:block">
          Powered by <span className="text-indigo-600 font-semibold">Google Gemini 3.0 Pro</span>
        </div>
      </div>
    </header>
  );
};