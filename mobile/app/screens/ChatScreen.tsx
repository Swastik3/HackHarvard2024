import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Audio } from 'expo-av';
import io from 'socket.io-client';

const ChatScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [socket, setSocket] = useState(null);
  const [recording, setRecording] = useState(null);

  useEffect(() => {
    // Initialize the WebSocket connection
    const newSocket = io('http://localhost:8765', {
      transports: ['websocket'],
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);

      // Periodically send audio chunks to the server
      const interval = setInterval(async () => {
        const status = await recording.getStatusAsync();
        if (status.isRecording) {
            const uri = recording.getURI();
            const audioData = await fetch(uri).then((res) => res.arrayBuffer());
            const base64String = btoa(String.fromCharCode(...new Uint8Array(audioData)));
          if (socket) {
            console.log('Streaming audio chunk...');
            socket.emit('audio-stream', base64String);
          }
        } else {
          clearInterval(interval);
        }
      }, 1000); // Send audio chunks every second
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    console.log('Stopping recording...');
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    setRecording(null);

    // Signal the server that the stream has ended
    if (socket) {
      socket.emit('audio-stream-end');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>
      <View style={styles.micButtonContainer}>
        <Button
          mode="contained"
          onPress={isRecording ? stopRecording : startRecording}
          style={styles.micButton}
          icon="microphone"
        >
          {isRecording ? 'Stop' : 'Start'} Recording
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  micButtonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  micButton: {
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});

export default ChatScreen;