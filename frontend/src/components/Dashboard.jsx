// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  getGoals,
  addGoal,
  completeGoal, // Imported the new function
  getTimeline,
  addNote,
} from '../api'; // Adjust the path as necessary
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

function Dashboard({ userId }) {
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
  const [selectedMood, setSelectedMood] = useState(3);

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

  // Handle Toggling Goal Completion
  const handleToggleGoal = async (goalId) => {
    try {
      const goal = goals.find((g) => g._id === goalId);
      if (!goal) {
        console.error(`Goal with ID ${goalId} not found.`);
        return;
      }

      if (!goal.completed) {
        // If goal is not completed, mark it as completed using the new endpoint
        const response = await completeGoal(goalId);
        const updatedGoal = response.data.goal;
        updatedGoal._id = goalId; // Restore the original goal ID
        updatedGoal.type = 'goal_completion'; // Ensure type aligns with your data handling
        updatedGoal.timestamp = Date.now(); // Already in milliseconds
        updatedGoal.task = goal.text; // Example, adjust as needed
        updatedGoal.status = 'Completed'; // Example, adjust as needed

        // Update the goals state
        setGoals((prevGoals) =>
          prevGoals.map((g) => (g._id === goalId ? { ...g, completed: updatedGoal.completed } : g))
        );

        // Optionally, refresh the timeline to include the new goal_completion item
        setTimeline((prevTimeline) => [updatedGoal, ...prevTimeline]);
      } else {
        // If goal is already completed and you want to allow uncompleting, implement accordingly
        // For now, we'll just prevent unmarking
        console.log('Goal is already completed.');
      }
    } catch (error) {
      console.error('Error completing goal:', error);
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
      <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Log Your Mood</h3>
        <div className="flex items-center space-x-4 mb-4">
          <label htmlFor="mood-select" className="text-gray-700">
            Select Mood Level:
          </label>
          <select
            id="mood-select"
            value={selectedMood}
            onChange={(e) => setSelectedMood(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
          >
            <option value={1}>1 - Very Sad</option>
            <option value={2}>2 - Sad</option>
            <option value={3}>3 - Neutral</option>
            <option value={4}>4 - Happy</option>
            <option value={5}>5 - Very Happy</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => {
              const today = new Date();
              const formattedDate = today.toISOString().split('T')[0];
              setMoodData((prevMoodData) => [...prevMoodData, { date: formattedDate, mood: selectedMood }]);
            }}
            className="px-4 py-2 bg-gradient-to-tr from-primary-light to-secondary text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Log Mood
          </button>
        </div>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
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
                  var itemDate;
                  try {
                    itemDate = new Date(item.timestamp);
                  } catch {
                    itemDate = new Date();
                  }
                  const selected = new Date(selectedDate);
                  return (
                    itemDate.getFullYear() === selected.getFullYear() &&
                    itemDate.getMonth() === selected.getMonth() &&
                    itemDate.getDate() === selected.getDate()
                  );
                })
                .map((item) => {
                  let itemId;
                  try {
                    itemId = item._id;
                  } catch {
                    itemId = Math.random().toString(36).substr(2, 9); // Generate a random ID
                  }
                  return <TimelineItem key={itemId} item={item} />;
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
