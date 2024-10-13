// src/components/TimelineItem.jsx
import React from 'react';
import { format } from 'date-fns';

function TimelineItem({ item }) {
  // Function to safely format the timestamp
  const getFormattedTime = () => {
    if (item.timestamp) {
      const date = new Date(item.timestamp);
      if (!isNaN(date)) {
        return format(date, 'PPpp'); // Example: Jan 1, 2024, 10:00 PM
      }
    }
    //return current time if timestamp is invalid
    return format(new Date(), 'PPpp');
  };

  // Function to render content based on item type
  const renderContent = () => {
    switch (item.type) {
      case 'notes':
        return (
          <p className="mt-2 text-gray-800">
            <strong>Content:</strong> {item.content || 'No content provided.'}
          </p>
        );

      case 'bot_conversation':
      case 'connection_conversation':
        if (Array.isArray(item.content) && item.content.length > 0) {
          return (
            <div className="mt-2 text-gray-800">
              <strong>Conversation:</strong>
              <ul className="list-disc list-inside mt-1">
                {item.content.map((msg, index) => (
                  <li key={index}>
                    <strong>{msg.sender}:</strong> {msg.message}
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return (
          <p className="mt-2 text-gray-800">
            <strong>Conversation:</strong> No messages available.
          </p>
        );

      case 'goal_completion':
        return (
          <div className="mt-2 text-gray-800">
            <p>
              <strong>Task:</strong> {item.task || 'No task description.'}
            </p>
            <p>
              <strong>Status:</strong> {item.completed ? 'Completed' : 'Incomplete'}
            </p>
          </div>
        );

      case 'emergency_call':
        return (
          <div className="mt-2 text-gray-800">
            <p>
              <strong>Hotline Called:</strong> {item.hotline_called || 'No hotline specified.'}
            </p>
          </div>
        );

      case 'connection_added':
        return (
          <div className="mt-2 text-gray-800">
            <p>
              <strong>Connection Name:</strong> {item.connection_name || 'No name provided.'}
            </p>
          </div>
        );

      default:
        return (
          <p className="mt-2 text-gray-800">
            <strong>Content:</strong> Unsupported content type.
          </p>
        );
    }
  };

  // Function to determine the CSS class for sentiment
  const getSentimentClass = () => {
    if (!item.sentiment) return 'bg-gray-100 text-gray-800';
    switch (item.sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'neutral':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to determine the CSS class for mood
  const getMoodClass = () => {
    if (!item.mood) return 'bg-gray-100 text-gray-800';
    const moodLower = item.mood.toLowerCase();
    if (['very happy', 'happy', 'relaxed', 'centered', 'calm'].includes(moodLower)) {
      return 'bg-green-100 text-green-800';
    } else if (['anxious'].includes(moodLower)) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-start mb-8 relative">
      {/* Connector Line and Dot */}
      <div className="absolute left-4 top-0 h-full border-l-2 border-gray-300"></div>
      <div className="absolute left-0 top-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
        <span className="dot"></span>
      </div>

      {/* Timeline Item */}
      <div className="ml-12 bg-white rounded-xl shadow-md p-6 w-full">
        {/* Header: Type and Time */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-700 capitalize">
            {item.type.replace(/_/g, ' ')}
          </span>
          <span className="text-sm text-gray-500">{getFormattedTime()}</span>
        </div>

        {/* Sentiment and Mood Badges */}
        {(item.sentiment || item.mood) && (
          <div className="flex space-x-4 mb-2">
            {item.sentiment && (
              <span className={`px-2 py-1 text-xs font-semibold rounded ${getSentimentClass()}`}>
                Sentiment: {item.sentiment}
              </span>
            )}
            {item.mood && (
              <span className={`px-2 py-1 text-xs font-semibold rounded ${getMoodClass()}`}>
                Mood: {item.mood}
              </span>
            )}
          </div>
        )}

        {/* Summary & Takeaways */}
        <div>
          <details className="group">
            <summary className="cursor-pointer text-blue-600 hover:underline">
              Summary & Takeaways
            </summary>
            <div className="mt-2 text-gray-700">
              <p>
                <strong>Summary:</strong> {item.summary || 'No summary available.'}
              </p>
              <p>
                <strong>Takeaways:</strong> {item.takeaways || 'No takeaways available.'}
              </p>
            </div>
          </details>
          {/* Render Content Based on Type */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default TimelineItem;
