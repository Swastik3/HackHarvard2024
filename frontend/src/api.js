// src/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Adjust the port if necessary

const userId = 1; // Assume userId is hardcoded for now
export const createUser = (userData) => axios.post(`${API_BASE_URL}/create_user`, userData);
export const getUser = (userId) => axios.get(`${API_BASE_URL}/user/1`);
export const getGoals = (userId) => axios.get(`${API_BASE_URL}/goals/1`); // You'll need to implement this endpoint
export const addGoal = (userId, goalData) => axios.post(`${API_BASE_URL}/goals/1`, goalData); // Implement this
export const updateGoal = (goalId, updatedData) => axios.patch(`${API_BASE_URL}/goals/${goalId}`, updatedData); // Implement this

export const getTimeline = (userId) => axios.get(`${API_BASE_URL}/timeline/1`);
export const addNote = (userId, noteData) => axios.post(`${API_BASE_URL}/notes`, { user_id: 1, ...noteData });
export const completeGoal = (goalId) => axios.post(`${API_BASE_URL}/goals/${goalId}/complete`);


// Add more API functions as needed
