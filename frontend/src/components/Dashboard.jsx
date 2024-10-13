// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { getGoals, addGoal, updateGoal, getTimeline, addNote } from '../api'; // Adjust the path as necessary
import { format } from 'date-fns';
import GoalItem from './GoalItem';
import TimelineItem from './TimelineItem';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Utility function to determine goal status based on frequency and expiry
const determineGoalStatus = (goal) => {
  const today = new Date();
  const expiryDate = goal.expiry ? new Date(goal.expiry) : null;
  if (expiryDate && today > expiryDate) {
    return 'Expired';
  }
  return goal.completed ? 'Completed' : 'In Progress';
};

function Dashboard({ userId }) { // Assume userId is passed as a prop
  // Goals State
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [errorGoals, setErrorGoals] = useState(null);

  // Mood Tracking State
  const [moodData, setMoodData] = useState([]);

  // Timeline State
  const [timeline, setTimeline] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [errorTimeline, setErrorTimeline] = useState(null);

  // Fetch Goals from Backend
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await getGoals(userId);
        console.log(response.data);
        setGoals(response.data);
      } catch (error) {
        setErrorGoals('Failed to load goals.');
        console.error('Error fetching goals:', error);
      } finally {
        setLoadingGoals(false);
      }
    };
    fetchGoals();
  }, [userId]);

  // Fetch Timeline from Backend
  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await getTimeline(userId);
        console.log(response.data);
        setTimeline(response.data);
      } catch (error) {
        setErrorTimeline('Failed to load timeline.');
        console.error('Error fetching timeline:', error);
      } finally {
        setLoadingTimeline(false);
      }
    };
    fetchTimeline();
  }, [userId]);

  // Handle Adding a New Goal
  const handleAddGoal = async () => {
    if (newGoal.trim()) {
      try {
        const goalData = {
          text: newGoal,
          completed: false,
          frequency: 'daily', // Example, adjust as needed
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          // Add other necessary fields
        };
        const response = await addGoal(userId, goalData);
        setGoals((prevGoals) => [...prevGoals, response.data]);
        setNewGoal('');
      } catch (error) {
        console.error('Error adding goal:', error);
      }
    }
  };

  const handleToggleGoal = async (goalId) => {
    try {
      const updatedGoal = goals.find((goal) => goal._id === goalId);
      if (!updatedGoal) {
        console.error(`Goal with ID ${goalId} not found.`);
        return;
      }
      const updatedData = { completed: !updatedGoal.completed, last_updated: new Date().toISOString() };
      await updateGoal(goalId, updatedData);
      setGoals((prevGoals) =>
        prevGoals.map((goal) =>
          goal._id === goalId ? { ...goal, ...updatedData } : goal
        )
      );
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  // Handle Adding a Note to Timeline
  const handleAddNote = async () => {
    if (note.trim()) {
      try {
        // For demonstration, we'll set sentiment and mood to 'NEUTRAL' and 'CALM' respectively.
        // In a real application, these values should be determined based on user input or analysis.
        const noteData = {
          content: note,
          summary: 'User added a new note.',
          sentiment: 'NEUTRAL', // Example, adjust as needed
          mood: 'CALM', // Example, adjust as needed
          type: 'notes', // Ensure type aligns with your data handling
          timestamp: Date.now(), // Already in milliseconds
        };
        const response = await addNote(userId, noteData);
        setTimeline((prevTimeline) => [response.data, ...prevTimeline]);
        setNote('');
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };

  // Prepare Chart Data
  const chartData = {
    labels: moodData.map((d) => format(new Date(d.date), 'MM/dd/yyyy')),
    datasets: [
      {
        label: 'Mood',
        data: moodData.map((d) => d.mood),
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
      legend: { display: false },
      title: { display: true, text: 'Mood Tracker', font: { size: 18 } },
    },
    scales: {
      y: { 
        beginAtZero: true, 
        max: 5, 
        ticks: { stepSize: 1 },
        title: {
          display: true,
          text: 'Mood Level',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Personal Goals Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Personal Goals</h2>

        {/* Add New Goal */}
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

        {/* Display Goals */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-6 transition-all duration-300 hover:shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Your Goals</h3>
          {loadingGoals ? (
            <p>Loading goals...</p>
          ) : errorGoals ? (
            <p className="text-red-500">{errorGoals}</p>
          ) : (
            <ul className="space-y-4">
              {goals.map((goal) => (
                <GoalItem key={goal._id} goal={goal} onToggle={handleToggleGoal} />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Mood Tracker Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Mood Tracker</h2>
        <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
          <div className="mb-4">
            <button
              onClick={() => {
                const today = new Date();
                const formattedDate = today.toISOString().split('T')[0];
                const mood = Math.floor(Math.random() * 5) + 1; // Replace with actual mood input
                setMoodData((prevMoodData) => [...prevMoodData, { date: formattedDate, mood }]);
              }}
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

      {/* Timeline Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Timeline</h2>
        
        {/* Add Note */}
        <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Add a Note</h3>
          <div className="flex space-x-4">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write a quick note..."
              className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
            <button
              onClick={handleAddNote}
              className="px-4 py-2 bg-gradient-to-tr from-primary-light to-secondary text-white rounded-md hover:opacity-90 transition-opacity"
            >
              Add Note
            </button>
          </div>
        </div>

        {/* Calendar and Timeline */}
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Calendar View */}
          <div className="w-full lg:w-1/3 mb-8 lg:mb-0">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              className="rounded-xl shadow-md p-4"
            />
          </div>

          {/* Timeline Display */}
          <div className="w-full lg:w-2/3">
            {loadingTimeline ? (
              <p>Loading timeline...</p>
            ) : errorTimeline ? (
              <p className="text-red-500">{errorTimeline}</p>
            ) : (
              timeline
                .filter((item) => {
                  const itemDate = new Date(item.timestamp);
                  const selected = new Date(selectedDate);
                  return (
                    itemDate.getFullYear() === selected.getFullYear() &&
                    itemDate.getMonth() === selected.getMonth() &&
                    itemDate.getDate() === selected.getDate()
                  );
                })
                .map((item) => <TimelineItem key={item._id} item={item} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
