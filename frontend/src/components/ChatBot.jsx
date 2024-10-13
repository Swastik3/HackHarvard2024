import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { SendIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
        const response = await fetch('http://localhost:8000/reset', {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Failed to reset conversation');
        }
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
        <div key={message.id} className="flex justify-end mb-4">
          <div className="bg-blue-500 text-white rounded-lg py-2 px-4 max-w-[70%] shadow-md">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      );
    } else if (message.role === 'assistant') {
      return (
        <div key={message.id} className="flex flex-col mb-4">
          <div className="bg-gray-100 rounded-lg py-2 px-4 max-w-[70%] shadow-md">
            <ReactMarkdown>{String(message.content)}</ReactMarkdown>
          </div>
          {message.people && Object.keys(message.people).length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold text-lg mb-2">Recommended People:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(message.people).map(([name, info]) => (
                  <div key={name} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                    <h5 className="font-semibold text-lg">{name}</h5>
                    <p className="text-sm text-gray-600">Age: {info.age}</p>
                    <p className="text-sm text-gray-600">Issue: {info.issue}</p>
                    <p className="mt-2 text-sm">{info.story}</p>
                    <button
                      onClick={() => handleCreateChat(name, info)}
                      className="mt-3 bg-green-500 text-white px-4 py-2 rounded-full text-sm hover:bg-green-600 transition-colors duration-300"
                    >
                      Chat with {name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
  }, [handleCreateChat]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg p-4">
      <div className="flex-grow mb-4 overflow-auto">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          placeholder="Type your message here..."
          disabled={isLoading}
          className="flex-grow p-2 border rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={handleSend} 
          disabled={isLoading}
          className="bg-blue-500 text-white px-6 py-2 rounded-r-full disabled:bg-blue-300 hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading ? 'Sending...' : <SendIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
});

export default ChatBot;