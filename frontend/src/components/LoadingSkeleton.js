import { useEffect } from 'react';

export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="glass-card rounded-xl overflow-hidden animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="h-48 bg-gray-800" />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-20 bg-gray-800 rounded" />
            </div>
            <div className="h-6 w-3/4 bg-gray-800 rounded mb-2" />
            <div className="h-4 w-full bg-gray-800 rounded mb-1" />
            <div className="h-4 w-2/3 bg-gray-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}