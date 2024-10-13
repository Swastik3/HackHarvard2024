import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useBeforeUnload } from 'react-router-dom';
import { Mic, StopCircle, Volume2, VolumeX } from 'lucide-react';

const SoundwaveAnimation = ({ isActive }) => {
  return (
    <div className={`w-64 h-16 flex items-center justify-center ${isActive ? 'opacity-100' : 'opacity-30'} transition-opacity duration-300`}>
      {[...Array(20)].map((_, index) => (
        <div
          key={index}
          className={`w-1 mx-[1px] bg-blue-500 rounded-full transform transition-all duration-150 ease-in-out ${
            isActive ? 'animate-soundwave' : 'h-2'
          }`}
          style={{
            animationDelay: `${index * 0.05}s`,
            height: isActive ? `${Math.random() * 100}%` : '8%',
          }}
        ></div>
      ))}
    </div>
  );
};

const VoiceBot = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(new Audio());
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      callUpdateEndpoint();
    };
  }, []);

  useBeforeUnload(() => {
    callUpdateEndpoint();
  });

  useEffect(() => {
    if (audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.onended = () => setIsPlaying(false);
    return () => {
      audio.onended = null;
    };
  }, []);

  const callUpdateEndpoint = async () => {
    try {
      const response = await fetch('http://localhost:8000/update', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to update');
      }
      console.log('Update successful');
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = sendAudioToBackend;

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const sendAudioToBackend = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'input.webm');

    try {
      const response = await fetch('http://localhost:8000/process_audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Audio processing failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      setError(null);
    } catch (error) {
      console.error('Error processing audio:', error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMouseDown = () => {
    startRecording();
  };

  const handleMouseUp = () => {
    stopRecording();
  };

  const togglePlayback = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-blue-600">Voice Assistant</h2>
      <SoundwaveAnimation isActive={isRecording || isPlaying} />
      <div className="flex items-center space-x-4">
        <button
          className={`p-6 rounded-full ${
            isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'
          } text-white focus:outline-none transition-all duration-300 transform hover:scale-105`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={stopRecording}
          disabled={isProcessing}
        >
          {isRecording ? <StopCircle size={32} /> : <Mic size={32} />}
        </button>
        {audioUrl && (
          <button
            onClick={togglePlayback}
            className={`p-4 ${isPlaying ? 'bg-green-500' : 'bg-blue-500'} text-white rounded-full focus:outline-none transition-all duration-300 transform hover:scale-105`}
          >
            {isPlaying ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        )}
      </div>
      <p className="text-lg font-semibold text-gray-700">
        {isRecording ? 'Recording...' : isProcessing ? 'Processing...' : 'Click and hold to record'}
      </p>
      {error && <p className="text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default VoiceBot;