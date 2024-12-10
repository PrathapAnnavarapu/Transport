import React, { useState } from 'react';
import { FaToggleOff, FaToggleOn } from "react-icons/fa6"

const CustomSwitch = () => {
    const [isOn, setIsOn] = useState(false);
  
    const toggleSwitch = () => {
      setIsOn(!isOn);
    };
  
    return (
      <div className={`custom-switch ${isOn ? 'active' : ''}`} onClick={toggleSwitch}>
        {isOn ? <FaToggleOn/> : <FaToggleOff/>} 
      </div>
    );
  };
  


export default CustomSwitch;

// SwitchComponent.js


