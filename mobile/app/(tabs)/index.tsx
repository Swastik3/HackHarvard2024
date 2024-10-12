import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Keyboard, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Communications from 'react-native-communications';
import * as FileSystem from 'expo-file-system';
import serverIp from '../../ip.js'

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Message {
  text: string;
  isUser: boolean;
}

export default function HomeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  useEffect(() => {
    async function checkSpeech() {
      const voices = await Speech.getAvailableVoicesAsync();
      // console.log('Available voices:', voices);
      if (!voices || voices.length === 0) {
        Alert.alert('Speech Unavailable', 'Text-to-speech is not available on this device.');
      }
    }
    checkSpeech();
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
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    if (uri) {
      await processAudioAndSend(uri);
    }
  };

  const processAudioAndSend = async (uri: string) => {
    try {
      const base64Audio = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const response = await fetch(`${serverIp}/process_audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audio: base64Audio }),
      });

      if (!response.ok) {
        throw new Error('Server response was not ok');
      }

      const data = await response.json();
      addMessage(data.text, false);
      await speakResponse(data.text);
      handleCall(data.number);
    } catch (error) {
      console.error('Error processing audio:', error);
      Alert.alert('Error', 'Failed to process audio. Please try again.');
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber && phoneNumber !== '0') {
      Communications.phonecall(phoneNumber, true);
    }
  };

  const addMessage = (text: string, isUser: boolean) => {
    setMessages(prevMessages => [...prevMessages, { text, isUser }]);
  };

  const speakResponse = async (text: string) => {
    try {
      console.log('Attempting to speak:', text);
      const options = {
        language: 'en',
        pitch: 1,
        rate: 1,
        onDone: () => console.log('Bot has finished speaking')
      };
      console.log('Speech options:', options);
      
      Speech.speak(text, options);
      console.log('Speech completed successfully');
    } catch (error) {
      console.error('Failed to speak:', error);
      Alert.alert('Speech Error', 'Failed to speak the response. Please check console for details.');
    }
  };

  const handleSend = async () => {
    if (inputText.trim()) {
      addMessage(inputText, true);
      setInputText('');
      try {
        console.log("sending the request")
        const response = await fetch(`${serverIp}/process_audio`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: inputText }),
        });

        if (!response.ok) {
          throw new Error('Server response was not ok');
        }

        const data = await response.json();
        const textResponse = `Response: ${data.text}\nPhone: ${data.number}\nName: ${data.name}`;
        addMessage(textResponse, false);
        await speakResponse(data.text);
        handleCall(data.number);
      } catch (error) {
        console.error('Error processing text:', error);
        Alert.alert('Error', 'Failed to process text. Please try again.');
      }
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      scrollToBottom
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      scrollToBottom
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messages]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.scrollViewContent}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        >
          {messages.map((message, index) => (
            <View key={index} style={[styles.messageBubble, message.isUser ? styles.userMessage : styles.botMessage]}>
              <ThemedText style={message.isUser ? styles.userMessageText : styles.botMessageText}>
                {message.text}
              </ThemedText>
            </View>
          ))}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#999"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={toggleRecording} style={styles.button}>
              <LinearGradient
                colors={['#ff0000', '#8b0000']}
                style={styles.gradientButton}
              >
                <Ionicons name={isRecording ? "stop" : "mic"} size={24} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSend} style={styles.button}>
              <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={styles.gradientButton}
              >
                <Ionicons name="send" size={24} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={handleCall} style={styles.button}>
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.gradientButton}
              >
                <Ionicons name="call" size={24} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity> */}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    padding: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50', // Green color for user messages
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2196F3', // Blue color for bot messages
  },
  userMessageText: {
    color: '#ffffff', // White text for user messages
  },
  botMessageText: {
    color: '#ffffff', // White text for bot messages
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#000',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    width: 40,
    height: 40,
    marginLeft: 5,
  },
  gradientButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});