
import React, { useState } from 'react'

import { useNavigate } from "react-router-dom"
import Cookies from 'js-cookie'
import { FiUser } from "react-icons/fi";
import { CiMobile1 } from "react-icons/ci";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import ToastComponent from '../Components/Toast'
import Button from '../Components/Button'

const Login = () => {
    const { info, error } = ToastComponent()
    const navigate = useNavigate()

    const [credentials, setCredentials] = useState({
        phone: '',
        password: '',
    })
    const [credentialsError, setCredentialsError] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const onHandleChangeCredentials = (e) => {
        const { name, value } = e.target
        setCredentials(prevState => ({
            ...prevState,
            [name]: value
        }))
    }


    const sendCredentialsToDB = async (msg) => {
        if (Object.keys(msg).length === 0) {
            setIsLoading(true);
            const url = 'http://127.0.0.1:5001/api/employee/login';

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    "Access-Control-Allow-Credentials": "true",
                },
                body: JSON.stringify(credentials),
            };

            try {
                const response = await fetch(url, options);
                if (response.ok) { // response.ok is true for status codes in the range 200-299
                    const data = await response.json();
                    Cookies.set('jwt_token', data.access_token);
                    setIsLoading(false);
                    navigate('/Employee/Dashboard');
                    info('You are Logged in Successfully');
                } else if (response.status === 400 || response.status === 401) {
                    const errorData = await response.json(); // Parse response to get the error message
                    setIsLoading(false);
                    const errorMessage = errorData.message || 'Please check the credentials';
                    error(errorMessage); // Assuming error function displays messages
                }
                else if (response.status === 403) {
                    const errorData = await response.json();
                    const errorMessage = errorData.message
                    error(errorMessage);
                    navigate('/Hughesnetwork-Management/login/ChangePassword')

                }
            } catch (err) {
                setIsLoading(false); // Ensure loading state is turned off in case of error
                error(err.message || 'An unexpected error occurred'); // Ensure error function handles errors properly
            }
        }
    };


    const checktheCredentials = (details) => {
        let errorObject = {}
        if (!details.phone) {
            errorObject.msg = 'Phone No should not be empty'
        }
        if (!details.password) {
            errorObject.msg = 'Password should not be empty'
        } if (!details.phone && !details.password) {
            errorObject.msg = 'Credentials should not be empty'
        }
        return errorObject
    }


    const checkCredentialsBeforeToSendToDB = (e) => {
        e.preventDefault()
        let errorMessage = checktheCredentials(credentials)
        sendCredentialsToDB(errorMessage)
        setCredentialsError(errorMessage)
    }

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };




    return (
        <>
            <div className="Login-lg">
                <div className='login-form-container'>
                    <form className="login-in-form" onSubmit={checkCredentialsBeforeToSendToDB}>
                        <img src='/Images/TEP.PA_BIG.png' alt='logo' className='hughes-logo' style={{ width: '208px', height: '38px', margin:'40px' }}/>                        
                        {Object.keys(credentialsError).length !== 0 && <h4 className='error-msg'>{credentialsError.msg}</h4>}
                        {/* <h3> Expense Management Software</h3> */}
                        <label htmlFor='username' className='label-text'>Mobile No<span className='mandatory'> *</span></label>
                        <div className='input-with-icon'>
                            <CiMobile1 className='icon'> + 91</CiMobile1>
                            <input
                                id='username'
                                type='text'
                                className='login-input-text-field'
                                placeholder='Phone'
                                name='phone'
                                value={credentials.username}
                                onChange={(e) => onHandleChangeCredentials(e)}
                            />
                        </div>
                        <label htmlFor='password' className='label-text'>Password<span className='mandatory'> *</span></label>
                        <div className='input-with-icon'>
                            <RiLockPasswordLine className='icon' />
                            <input
                                id='password'
                                type={isPasswordVisible ? 'text' : 'password'}
                                className='login-input-text-field'
                                placeholder='Password'
                                name='password'
                                value={credentials.password}
                                onChange={(e) => onHandleChangeCredentials(e)}
                            />
                            <span
                                className="eye-icon"
                                onClick={togglePasswordVisibility} // Toggle visibility on click
                                style={{ cursor: 'pointer' }}
                            >
                                {isPasswordVisible ? <FaEyeSlash /> : <FaEye />} {/* Toggle between eye and eye-slash */}
                            </span>
                        </div>
                        <h5 className='forgetPass' onClick={() => navigate('/ForgetPassword')}>Forgot Password?</h5>
                        <Button type='submit' className='main-primary-button' text={isLoading ? 'Loading' : 'Log In'} />
                        <h5 className='forgetPass' onClick={() => navigate('/employee/signup')}>Set password?</h5>
                    </form>
                </div>
            </div>
            <div className="Login-sm" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/Images/Walletminded-NEW2-1.png)`, backgroundPosition: 'center', width: '100%', height: '100%' }}>
                <form className="login-in-form-sm" onSubmit={checkCredentialsBeforeToSendToDB} >
                    {Object.keys(credentialsError).length !== 0 && <p className='error-msg'>{credentialsError.msg}</p>}
                    <h3> Enter Your Username and Password to Continue</h3>
                    <label htmlFor='username-sm' className='label-text'>UserName<span className='mandatory'> *</span></label>
                    <div className='input-with-icon'>
                        <FiUser className='icon' />
                        <input
                            id='username-sm'
                            type='text'
                            className='login-input-text-field'
                            placeholder='User Name'
                            name='phone'
                            value={credentials.phone}
                            onChange={(e) => onHandleChangeCredentials(e)}
                        />
                    </div>
                    <label htmlFor='password-sm' className='label-text'>Password<span className='mandatory'> *</span></label>
                    <div className='input-with-icon'>
                        <RiLockPasswordLine className='icon' />
                        <input
                            id='password-sm'
                            type='password'
                            className='login-input-text-field'
                            placeholder='Password'
                            name='password'
                            value={credentials.password}
                            onChange={(e) => onHandleChangeCredentials(e)}
                        />
                    </div>
                    <h5 className='forgetPass' onClick={() => navigate('/ForgetPassword')}>Forgot Password?</h5>
                    <Button type='submit' className='main-primary-button' text={isLoading ? 'LOADING...' : 'Log In'} />
                    <h5 className='forgetPass' onClick={() => navigate('/employee/signup')}>Set password?</h5>
                </form>
            </div>
        </>
    )
}

export default Login