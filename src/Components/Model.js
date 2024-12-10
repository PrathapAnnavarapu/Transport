import React from 'react';

const Popup = ({ isOpen, onClose, children, specialClass }) => {
  if (!isOpen) return null;

  const popupClass = isOpen ? 'popup' : 'popup hidden';
  const popupStyle = specialClass ? { width: '80vw', height: '90vh', padding: '10px', maxWidth:'1240px' } : {};
  const newPopupStyle = specialClass === false ? {width: '50vw', height: '95vh'} :{}


    return (
    
    <div className="popup-overlay">
      <div className={popupClass} style={specialClass ? popupStyle : newPopupStyle} >
        <button className="popup-close-button comment-icon" data-tooltip='Close' onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default React.memo(Popup);
