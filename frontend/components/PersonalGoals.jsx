import React, { useState } from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const GoalsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const GoalInput = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const GoalList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const GoalItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const ChartContainer = styled.div`
  margin-top: 20px;
`;

// Dummy data for personal goals
const dummyGoals = [
  { text: "Meditate for 10 minutes daily", completed: false },
  { text: "Exercise 3 times a week", completed: true },
  { text: "Practice gratitude journaling", completed: false },
  { text: "Reduce screen time before bed", completed: false },
  { text: "Connect with a friend or family member daily", completed: true }
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
      setGoals(prevGoals => [...prevGoals, { text: newGoal, completed: false }]);
      setNewGoal('');
    }
  };

  const handleToggleGoal = (index) => {
    setGoals(prevGoals => prevGoals.map((goal, i) => 
      i === index ? { ...goal, completed: !goal.completed } : goal
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
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  return (
    <GoalsContainer>
      <h2>Personal Goals</h2>
      <GoalInput
        value={newGoal}
        onChange={(e) => setNewGoal(e.target.value)}
        placeholder="Enter your goal..."
      />
      <button onClick={handleAddGoal}>Add Goal</button>
      <GoalList>
        {goals.map((goal, index) => (
          <GoalItem key={index}>
            <Checkbox
              type="checkbox"
              checked={goal.completed}
              onChange={() => handleToggleGoal(index)}
            />
            {goal.text}
          </GoalItem>
        ))}
      </GoalList>
      <button onClick={handleMoodSubmit}>Log Today's Mood</button>
      <ChartContainer>
        <Line data={chartData} />
      </ChartContainer>
    </GoalsContainer>
  );
}

export default PersonalGoals;