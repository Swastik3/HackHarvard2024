import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Sidebar from './components/SideBar';
import ChatBot from './components/ChatBot';
import Chats from './components/Chats';
import Dashboard from './components/Dashboard';
import Emergency from './components/Emergency';
import VoiceBot from './components/VoiceBot';
import './index.css';
import UploadPrescription from './components/UploadPrescription';

function App() {
  const [chats, setChats] = useState([]);

  const handleCreateChat = (name, info) => {
    setChats(prev => {
      if (prev.some(chat => chat.name === name)) return prev;
      return [...prev, { id: Date.now().toString(), name, info, messages: [] }];
    });
  };

  const handleRemoveChat = (chatId) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
  };

  const handleUpdateChat = (chatId, newMessages) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, messages: newMessages } : chat
    ));
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
        <Sidebar />
        <div className="flex-grow ml-64 p-8 max-h-screen overflow-y-auto">
          <Routes>
            <Route path="/chatbot" element={
              <div>
                <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Build your SafeSpace</h1>
                <ChatBot onCreateChat={handleCreateChat} />
              </div>
            } />
            <Route path="/chats" element={
              <div>
                <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Your Chats</h1>
                <Chats 
                  chats={chats} 
                  onRemoveChat={handleRemoveChat} 
                  onUpdateChat={handleUpdateChat}
                />
              </div>
            } />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/voicebot" element={<VoiceBot />} />
            <Route path="/upload" element={<UploadPrescription />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;