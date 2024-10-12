import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Audio } from 'expo-av';
import io from 'socket.io-client';

const ChatScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);

  useEffect(() => {
    // Initialize the WebSocket connection
    const newSocket = io('http://localhost:8765', {
      transports: ['websocket'],
    });
    setSocket(newSocket);

    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);

      // Start streaming audio to the server
      streamAudioToServer(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    // Signal the server that the stream has ended
    if (socket) {
      socket.emit('audio-stream-end');
    }
  };

  const streamAudioToServer = async (recording: Audio.Recording) => {
    if (!socket) return;

    while (isRecording) {
      const status = await recording.getStatusAsync();
      if (status.isDoneRecording) break;

      const uri = recording.getURI();
      if (uri) {
        try {
          // Read the audio file as a binary buffer
          const response = await fetch(uri);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          // Send the audio data to the server
          socket.emit('audio-stream', uint8Array);
        } catch (error) {
          console.error('Error streaming audio:', error);
        }
      }

      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
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
    bottom: 20, // Adjust this value based on the height of your bottom navigation bar
    alignSelf: 'center', // Center the button horizontally
  },
  micButton: {
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});

export default ChatScreen;