

import React from 'react'

const Dropdown = (props) => {
    const { options, className, htmlFor, id, labelClassName, label, onChange, placeholder, name, dropDownList, value, mandatory} = props
    
    return (
        <div className='input-field-container'>
            <label htmlFor={htmlFor} className={labelClassName}>{label} <span className='mandatory'>{mandatory}</span></label>
            <input list ={dropDownList} id={id} name={name} className={className} onChange={onChange} placeholder={placeholder} value={value}/>
            <datalist id={dropDownList}>
                {options.map((eachValue)=>{
                    return  <option key={eachValue} value={eachValue}>{eachValue}</option>
               })}
            </datalist>
        </div>
    )
}

export default React.memo(Dropdown)
