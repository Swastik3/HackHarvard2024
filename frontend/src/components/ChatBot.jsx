import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { SendIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBot = React.memo(({ onCreateChat }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const resetConversation = async () => {
      try {
        const response = await fetch('http://localhost:8000/reset', { method: 'POST' });
        if (!response.ok) throw new Error('Failed to reset conversation');
        console.log('Conversation reset successfully');
        setMessages([]);
      } catch (error) {
        console.error('Error resetting conversation:', error);
      }
    };
    resetConversation();
  }, []);

  const addMessage = useCallback((newMessage) => {
    setMessages(prevMessages => [...prevMessages, newMessage]);
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessageId = `user-${Date.now()}`;
    const userMessage = { id: userMessageId, role: 'user', content: input };
    addMessage(userMessage);
    setInput('');

    try {
      const response = await fetch('http://localhost:8000/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      if (data.messages && data.messages.length > 0) {
        const latestAssistantMessage = data.messages.reverse().find(msg => msg.role === 'assistant');
        if (latestAssistantMessage) {
          const assistantMessageId = `assistant-${Date.now()}`;
          addMessage({
            id: assistantMessageId,
            role: 'assistant',
            content: latestAssistantMessage.content.response,
            people: latestAssistantMessage.content.people,
          });
        }
      } else {
        const noResponseMessageId = `assistant-${Date.now()}-noresponse`;
        addMessage({ id: noResponseMessageId, role: 'assistant', content: "I'm here to help. Please let me know if there's anything you'd like to discuss." });
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessageId = `error-${Date.now()}`;
      addMessage({ 
        id: errorMessageId, 
        role: 'assistant', 
        content: "Sorry, I couldn't process your request. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, addMessage]);

  const handleCreateChat = useCallback((name, info) => {
    onCreateChat(name, info);
    navigate(`/chats?chatId=${Date.now().toString()}`);
  }, [navigate, onCreateChat]);

  const renderMessage = useCallback((message) => {
    if (message.role === 'user') {
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex justify-end mb-4"
        >
          <div className="bg-blue-500 text-white rounded-2xl py-2 px-3 max-w-[70%] shadow-lg">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </motion.div>
      );
    } else if (message.role === 'assistant') {
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex flex-col mb-4"
        >
          <div className="bg-gray-100 rounded-2xl py-2 px-3 max-w-[70%] shadow-md">
            <ReactMarkdown>{String(message.content)}</ReactMarkdown>
          </div>
          {message.people && Object.keys(message.people).length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4"
            >
              <h4 className="font-bold text-lg mb-2 text-gray-700">Recommended People:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(message.people).map(([name, info]) => (
                  <motion.div
                    key={name}
                    whileHover={{ scale: 1.03 }}
                    className="bg-white rounded-xl shadow-lg p-3 border border-gray-200 transition-all duration-300 hover:shadow-xl"
                  >
                    <h5 className="font-semibold text-base text-gray-800">{name}</h5>
                    <p className="text-xs text-gray-600">Age: {info.age}</p>
                    <p className="text-xs text-gray-600">Issue: {info.issue}</p>
                    <p className="mt-1 text-sm text-gray-700">{info.story}</p>
                    <button
                      onClick={() => handleCreateChat(name, info)}
                      className="mt-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Chat with {name}
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      );
    }
  }, [handleCreateChat]);

  return (
    <div className="flex flex-col h-[90vh] max-w- mx-auto bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-2xl p-4">
      <div className="flex-grow mb-4 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100 pr-4">
          <AnimatePresence>
            {messages.map(renderMessage)}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          placeholder="Type your message here..."
          disabled={isLoading}
          className="flex-grow p-2 border-2 border-blue-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
        />
        <button 
          onClick={handleSend} 
          disabled={isLoading}
          className="bg-blue-500 text-white p-2 rounded-full disabled:bg-blue-300 hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <SendIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
});

export default ChatBot;