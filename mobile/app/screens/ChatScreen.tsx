import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Audio } from 'expo-av';
import io from 'socket.io-client';

const ChatScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [socket, setSocket] = useState(null);
  const recordingRef = useRef(null);
  const lastDurationRef = useRef(0);

  useEffect(() => {
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
  
    newSocket.on('connect_error', (error) => {
      console.log('WebSocket connection error:', error);
    });
  
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const getNewAudioChunk = async (newDuration) => {
    console.log(`getNewAudioChunk called. newDuration: ${newDuration}, lastDuration: ${lastDurationRef.current}`);
    if (newDuration > lastDurationRef.current) {
      const uri = recordingRef.current.getURI();
      const audioData = await fetch(uri).then((res) => res.arrayBuffer());
      const fullAudioBuffer = new Uint8Array(audioData);

      // Calculate the start index for the new chunk
      const startIndex = Math.floor(lastDurationRef.current * 44.1); // Assuming 44.1kHz sample rate
      const newChunk = fullAudioBuffer.slice(startIndex);

      console.log(`New chunk length: ${newChunk.length} bytes`);

      lastDurationRef.current = newDuration;

      if (newChunk.length > 0) {
        const base64Audio = btoa(String.fromCharCode.apply(null, newChunk));
        console.log(`Base64 audio length: ${base64Audio.length} characters`);
        return base64Audio;
      } else {
        console.log("No new audio data");
        return null;
      }
    } else {
      console.log('No new duration, skipping chunk');
    }
    return null;
  };

  const startRecording = async () => {
    console.log('startRecording function called');
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    console.log('Starting recording..');
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync({
      android: {
        extension: '.m4a',
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: '.m4a',
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    });
    await recording.startAsync();
    recordingRef.current = recording;
    setIsRecording(true);

    const interval = setInterval(async () => {
      if (recordingRef.current && isRecording) {
        const status = await recordingRef.current.getStatusAsync();
        console.log(`Recording status: ${JSON.stringify(status)}`);
        const newDuration = status.durationMillis;
        const newAudioChunk = await getNewAudioChunk(newDuration);
    
        if (newAudioChunk) {
          console.log(`Sending audio chunk. Length: ${newAudioChunk.length}`);
          if (socket) {
            socket.emit('audio-stream', newAudioChunk);
            console.log('Audio chunk emitted to server');
          } else {
            console.log('Socket is not available');
          }
        } else {
          console.log("No new audio chunk to send");
        }
      } else {
        console.log('Recording ref or isRecording is false, clearing interval');
        clearInterval(interval);
      }
    }, 100);
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    console.log('Stopping recording...');
    setIsRecording(false);

    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;
    }

    lastDurationRef.current = 0;

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