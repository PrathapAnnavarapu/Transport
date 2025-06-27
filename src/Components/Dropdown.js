import React from 'react';

const Dropdown = ({
  options = [],
  className,
  htmlFor,
  id,
  labelClassName,
  label,
  onChange,
  placeholder,
  name,
  dropDownList,
  value,
  mandatory,
  style
}) => {
  return (
    <div className="input-field-container">
      <label htmlFor={htmlFor} className={labelClassName}>
        {label} <span className="mandatory">{mandatory ? '*' : ''}</span>
      </label>
      <input
        list={dropDownList}
        id={id}
        name={name}
        className={className}
        onChange={onChange}
        placeholder={placeholder}
        value={value}
        style={style}
        onFocus={(e) => {
          // Ensures the dropdown opens even when value is preselected
          const currentValue = e.target.value;
          e.target.value = '';
          setTimeout(() => {
            e.target.value = currentValue;
          }, 0);
        }}
      />
      <datalist id={dropDownList}>
        {options && options.length > 0 ? (
          options.map((eachValue, index) => (
            <option key={index} value={eachValue}>
              {eachValue}
            </option>
          ))
        ) : (
          <option value="">No options available</option>
        )}
      </datalist>
    </div>
  );
};

export default React.memo(Dropdown);
