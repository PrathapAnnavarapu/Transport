// ThreeDotsLoader.jsx
import React from 'react';

const ThreeDotsLoader = ({ color = '#ffffff', size = '64px' }) => {
  return (
    <div className="lds-ellipsis" style={{ width: size, height: size }}>
      <div style={{ background: color }}></div>
      <div style={{ background: color }}></div>
      <div style={{ background: color }}></div>
      <div style={{ background: color }}></div>
    </div>
  );
};

export default ThreeDotsLoader;
