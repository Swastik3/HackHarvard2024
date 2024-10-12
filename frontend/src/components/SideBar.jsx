import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`block py-3 px-4 rounded-lg transition-all duration-200 hover:bg-white/10 hover:translate-x-1 ${
          isActive ? 'font-bold bg-white/20' : ''
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-gradient-to-b from-primary-light to-secondary p-8 shadow-lg">
      <h1 className="text-2xl font-bold text-white text-center mb-8 pb-4 border-b-2 border-white/20">
        HealthCare App
      </h1>
      <nav className="flex flex-col gap-4 text-white">
        <NavLink to="/">Chat with AI</NavLink>
        <NavLink to="/chats">Your Chats</NavLink>
        <NavLink to="/goals">Personal Goals</NavLink>
        <NavLink to="/community">Community</NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;