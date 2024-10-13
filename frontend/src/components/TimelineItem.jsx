// src/components/TimelineItem.jsx
import React from 'react';
import { format } from 'date-fns';

function TimelineItem({ item }) {
  return (
    <div className="flex items-start mb-8 relative">
      {/* Connector Line and Dot */}
      <div className="absolute left-4 top-0 h-full border-l-2 border-gray-300"></div>
      <div className="absolute left-0 top-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
        <span className="dot"></span>
      </div>

      {/* Timeline Item */}
      <div className="ml-12 bg-white rounded-xl shadow-md p-6 w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-700 capitalize">{item.type}</span>
          <span className="text-sm text-gray-500">{format(new Date(item.timestamp * 1000), 'p')}</span>
        </div>
        <div className="flex space-x-4 mb-2">
          <span
            className={`px-2 py-1 text-xs font-semibold rounded ${
              item.sentiment > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            Sentiment: {item.sentiment}
          </span>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded ${
              item.mood > 3 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            Mood: {item.mood}
          </span>
        </div>
        <div>
          <details className="group">
            <summary className="cursor-pointer text-blue-600 hover:underline">Summary & Takeaways</summary>
            <div className="mt-2 text-gray-700">
              <p><strong>Summary:</strong> {item.summary || 'No summary available.'}</p>
              <p><strong>Takeaways:</strong> {item.takeaways || 'No takeaways available.'}</p>
            </div>
          </details>
          <p className="mt-2 text-gray-800"><strong>Content:</strong> {item.content}</p>
        </div>
      </div>
    </div>
  );
}

export default TimelineItem;
