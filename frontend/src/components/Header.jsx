import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: #4a90e2;
  padding: 1rem;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: center;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

function Header() {
  return (
    <HeaderContainer>
      <Nav>
        <NavLink to="/">Chat with AI</NavLink>
        <NavLink to="/goals">Personal Goals</NavLink>
        <NavLink to="/community">Community</NavLink>
      </Nav>
    </HeaderContainer>
  );
}

export default Header;