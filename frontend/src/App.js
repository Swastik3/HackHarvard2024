import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/SideBar';
import ChatBot from './components/ChatBot';
import PersonalGoals from './components/PersonalGoals';
import Community from './components/Community';
import './index.css';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
        <Sidebar />
        <div className="flex-grow ml-72 p-8 max-h-screen overflow-y-auto">
          <Routes>
            <Route path="/" element={<ChatBot />} />
            <Route path="/goals" element={<PersonalGoals />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;