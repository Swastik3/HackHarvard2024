import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import ChatScreen from './screens/ChatScreen';
import TimelineScreen from './screens/TimelineScreen';
import PeopleScreen from './screens/PeopleScreen';

const Tab = createBottomTabNavigator();

function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Chat') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Timeline') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'People') {
            iconName = focused ? 'people' : 'people-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: '#f0f0f0',
          // Remove position: 'absolute' to avoid layout issues
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Timeline" component={TimelineScreen} />
      <Tab.Screen name="People" component={PeopleScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <MainNavigator />
    </PaperProvider>
  );
}