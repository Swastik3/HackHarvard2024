// src/components/GoalItem.jsx
import React from 'react';

function GoalItem({ goal, onToggle }) {
  const determineStatus = () => {
    const today = new Date();
    const expiryDate = goal.expiry ? new Date(goal.expiry) : null;
    if (expiryDate && today > expiryDate) return 'Expired';
    return goal.completed ? 'Completed' : 'In Progress';
  };

  const status = determineStatus();

  return (
    <li className="flex items-center space-x-3">
      <input
        type="checkbox"
        checked={goal.completed}
        onChange={() => onToggle(goal.id)}
        className="form-checkbox h-5 w-5 text-primary-light rounded focus:ring-primary-light"
      />
      <span className={`flex-grow ${goal.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
        {goal.text}
      </span>
      <span
        className={`px-2 py-1 text-xs font-semibold rounded ${
          status === 'Completed'
            ? 'bg-green-100 text-green-800'
            : status === 'Expired'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}
      >
        {status}
      </span>
    </li>
  );
}

export default GoalItem;
