import React from 'react'

const Button = (props) => {
    const {type, className, text, onClick} = props
    return(
        <button type={type} className = {className} onClick={onClick}>{text}</button>
    )
}

export default  React.memo(Button)