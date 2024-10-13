import React from 'react';

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

export default SoundwaveAnimation;