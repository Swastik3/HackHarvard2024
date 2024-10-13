import React, { useState, useEffect } from 'react';
import { UserIcon, SendIcon, XIcon, ArrowLeftIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Chats = ({ chats, onRemoveChat, onUpdateChat }) => {
  const [activeChat, setActiveChat] = useState(null);
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const chatIdFromQuery = new URLSearchParams(location.search).get('chatId');
    if (chatIdFromQuery) {
      setActiveChat(chatIdFromQuery);
    }
  }, [location]);

  const handleSend = (chatId) => {
    if (!input.trim()) return;
    const updatedChat = chats.find(chat => chat.id === chatId);
    if (updatedChat) {
      const newMessages = [...updatedChat.messages, { role: 'user', content: input }];
      onUpdateChat(chatId, newMessages);
      setInput('');
    }
  };

  const renderChatList = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {chats.map((chat) => (
        <motion.div 
          key={chat.id} 
          whileHover={{ scale: 1.03 }}
          className="bg-white rounded-xl shadow-lg p-4 transition-all duration-300 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <UserIcon className="w-8 h-8 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold">{chat.name}</h3>
            </div>
            <button
              onClick={() => onRemoveChat(chat.id)}
              className="text-gray-500 hover:text-red-500 transition-colors duration-300"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-1">Age: {chat.info.age}</p>
          <p className="text-sm text-gray-600 mb-1">Issue: {chat.info.issue}</p>
          <p className="text-sm mb-4 line-clamp-3 text-gray-700">{chat.info.story}</p>
          <button
            onClick={() => setActiveChat(chat.id)}
            className="w-full bg-green-500 text-white py-2 rounded-full hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Chat with {chat.name}
          </button>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderActiveChat = () => {
    const chat = chats.find(c => c.id === activeChat);
    if (!chat) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-2xl p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <UserIcon className="w-8 h-8 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">{chat.name}</h2>
          </div>
          <button
            onClick={() => setActiveChat(null)}
            className="text-gray-500 hover:text-red-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-full p-1"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-grow mb-4 p-4 rounded-xl overflow-auto bg-white shadow-inner">
          <AnimatePresence>
            {chat.messages.map((msg, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
              >
                <div className={`rounded-2xl py-2 px-4 max-w-[70%] ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex gap-2 bg-white p-2 rounded-full shadow-md">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend(chat.id)}
            placeholder={`Chat with ${chat.name}...`}
            className="flex-grow p-2 bg-transparent focus:outline-none"
          />
          <button 
            onClick={() => handleSend(chat.id)}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-[90vh] w-[90h] mx-auto overflow-hidden">
      <AnimatePresence mode="wait">
        {activeChat ? renderActiveChat() : renderChatList()}
      </AnimatePresence>
    </div>
  );
};

export default Chats;