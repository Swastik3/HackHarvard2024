import React, { useState, useEffect, useRef } from 'react';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('http://localhost:8000/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const newMessages = data.messages.filter(msg => msg.role !== 'system');
      setMessages(prev => [...prev, ...newMessages]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: { response: "Sorry, I couldn't process your request. Please try again." } }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message, index) => {
    if (message.role === 'user') {
      return (
        <div key={index} className="flex justify-end mb-4">
          <div className="bg-blue-500 text-white rounded-lg py-2 px-4 max-w-[70%]">
            {message.content}
          </div>
        </div>
      );
    } else if (message.role === 'assistant') {
      const content = typeof message.content === 'string' ? JSON.parse(message.content) : message.content;
      return (
        <div key={index} className="flex flex-col mb-4">
          <div className="bg-gray-200 rounded-lg py-2 px-4 max-w-[70%]">
            {content.response}
          </div>
          {content.people && Object.keys(content.people).length > 0 && (
            <div className="mt-2">
              <h4 className="font-bold">Recommended People:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {Object.entries(content.people).map(([name, info]) => (
                  <div key={name} className="bg-white shadow-md rounded-lg p-4">
                    <h5 className="font-semibold">{name}</h5>
                    <p>Age: {info.age}</p>
                    <p>Issue: {info.issue}</p>
                    <p className="mt-2 text-sm">{info.story}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Mental Health Chat</h2>
      <div className="flex-grow mb-4 p-4 border rounded-lg overflow-auto">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message here..."
          disabled={isLoading}
          className="flex-grow p-2 border rounded"
        />
        <button 
          onClick={handleSend} 
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;