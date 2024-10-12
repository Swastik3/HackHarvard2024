import React, { useState, useEffect } from 'react';

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, isUser: true }]);
      setInput('');
      // Simulate AI response
      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, { text: "I'm here to help. How can I assist you today?", isUser: false }]);
      }, 1000);
    }
  };

  useEffect(() => {
    // Scroll to bottom of message list
    const messageList = document.getElementById('message-list');
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white rounded-xl overflow-hidden shadow-md">
      <div id="message-list" className="flex-1 overflow-y-auto p-5 flex flex-col">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[60%] p-3 my-2 rounded-2xl ${
              message.isUser
                ? 'self-end bg-gradient-to-r from-primary-light to-secondary text-white'
                : 'self-start bg-gray-100'
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>
      <div className="flex p-5 bg-gray-50 border-t border-gray-200">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-light"
        />
        <button
          onClick={handleSend}
          className="ml-3 px-6 py-3 bg-gradient-to-tr from-primary-light to-secondary text-white rounded-full hover:opacity-90 transition-opacity"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatBot;