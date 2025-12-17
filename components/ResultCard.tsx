import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { GroundingChunk } from '../types';

interface ResultCardProps {
  chunk: GroundingChunk;
  index: number;
}

export const ResultCard: React.FC<ResultCardProps> = ({ chunk, index }) => {
  if (!chunk.web) return null;

  const { uri, title } = chunk.web;
  
  let domain = 'web';
  try {
    domain = new URL(uri).hostname.replace('www.', '');
  } catch (e) {
    // Fallback
  }

  return (
    <a 
      href={uri} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group block bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Globe className="w-4 h-4" />
          </div>
        </div>
        <div className="flex-grow min-w-0">
          <p className="text-xs text-gray-500 mb-0.5 truncate">{domain}</p>
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 leading-snug line-clamp-2">
            {title}
          </h3>
          <div className="mt-2 flex items-center text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Visit Website <ExternalLink className="w-3 h-3 ml-1" />
          </div>
        </div>
        <div className="text-xs font-mono text-gray-300">
          #{index + 1}
        </div>
      </div>
    </a>
  );
};