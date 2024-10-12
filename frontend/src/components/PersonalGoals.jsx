import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Dummy data for personal goals
const dummyGoals = [
  { id: 1, text: "Meditate for 10 minutes daily", completed: false },
  { id: 2, text: "Exercise 3 times a week", completed: true },
  { id: 3, text: "Practice gratitude journaling", completed: false },
  { id: 4, text: "Reduce screen time before bed", completed: false },
  { id: 5, text: "Connect with a friend or family member daily", completed: true }
];

// Dummy data for mood tracking
const dummyMoodData = [
  { date: "2023-06-01", mood: 3 },
  { date: "2023-06-02", mood: 4 },
  { date: "2023-06-03", mood: 2 },
  { date: "2023-06-04", mood: 5 },
  { date: "2023-06-05", mood: 4 }
];

function PersonalGoals() {
  const [goals, setGoals] = useState(dummyGoals);
  const [newGoal, setNewGoal] = useState('');
  const [moodData, setMoodData] = useState(dummyMoodData);

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setGoals(prevGoals => [...prevGoals, { id: Date.now(), text: newGoal, completed: false }]);
      setNewGoal('');
    }
  };

  const handleToggleGoal = (id) => {
    setGoals(prevGoals => prevGoals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const handleMoodSubmit = () => {
    const today = new Date().toISOString().split('T')[0];
    const mood = Math.floor(Math.random() * 5) + 1; // Random mood for demonstration
    setMoodData(prevMoodData => [...prevMoodData, { date: today, mood }]);
  };

  const chartData = {
    labels: moodData.map(d => d.date),
    datasets: [
      {
        label: 'Mood',
        data: moodData.map(d => d.mood),
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Mood Tracker',
        font: {
          size: 18,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Personal Goals</h2>
      
      <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Add New Goal</h3>
        <div className="flex space-x-4">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Enter your goal..."
            className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
          <button
            onClick={handleAddGoal}
            className="px-4 py-2 bg-gradient-to-tr from-primary-light to-secondary text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Add Goal
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Your Goals</h3>
        <ul className="space-y-4">
          {goals.map((goal) => (
            <li key={goal.id} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={goal.completed}
                onChange={() => handleToggleGoal(goal.id)}
                className="form-checkbox h-5 w-5 text-primary-light rounded focus:ring-primary-light"
              />
              <span className={`flex-grow ${goal.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                {goal.text}
              </span>
              <span className={`px-2 py-1 text-xs font-semibold rounded ${goal.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {goal.completed ? 'Completed' : 'In Progress'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Mood Tracker</h3>
        <div className="mb-4">
          <button
            onClick={handleMoodSubmit}
            className="px-4 py-2 bg-gradient-to-tr from-primary-light to-secondary text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Log Today's Mood
          </button>
        </div>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default PersonalGoals;