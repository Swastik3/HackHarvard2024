import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import ChatBot from './components/ChatBot';
import PersonalGoals from './components/PersonalGoals';
import Community from './components/Community';

const AppContainer = styled.div`
  font-family: 'Arial', sans-serif;
  color: #333;
  background-color: #f0f4f8;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

function App() {
  return (
    <Router>
      <AppContainer>
        <Header />
        <ContentContainer>
          <Routes>
            <Route path="/" element={<ChatBot />} />
            <Route path="/goals" element={<PersonalGoals />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </ContentContainer>
      </AppContainer>
    </Router>
  );
}

export default App;