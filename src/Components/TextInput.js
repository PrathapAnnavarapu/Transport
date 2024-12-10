

import React from 'react'

const Textinput = (props) => {
    const {htmlFor, label, id, type, className, labelClassName, placeholder, onChange, name, disabled, altClassName, value, mandatory, onKeyPress} = props
   

   
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (typeof onKeyPress === 'function') {
        onKeyPress(e); // Call onKeyPress function with the event object
      }
    }
  };

    return (
        <div className={`input-field-container-${altClassName}`}>
            <label htmlFor={htmlFor} className={labelClassName}>{label} <span className='mandatory'>{mandatory}</span></label>
            <input id={id} type={type} className={className} placeholder={placeholder} onChange={onChange} name={name} disabled={disabled} value={value} onKeyPress={handleKeyPress}/>
        </div>
    )
}

export default React.memo(Textinput)