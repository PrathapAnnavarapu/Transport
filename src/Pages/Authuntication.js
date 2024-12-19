import React, { useState } from 'react';
import Cookies from 'js-cookie';
import ToastComponent from '../Components/Toast';
import Button from '../Components/Button';


const Authentication = () => {

    const [accountOptions ]= useState(['account option1', 'account option2']);
    const { success, error } = ToastComponent();

    const [credentials, setCredentials] = useState({
        accountNumber: '',
        
    });
    const [credentialsError, setCredentialsError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const sendCredentialsToDB = async (msg) => {
        if (Object.keys(msg).length === 0) {
            setIsLoading(true);            
            const url = '';

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            };

            try {
                const response = await fetch(url, options);

                if (response.ok) {
                    const data = await response.json();
                    Cookies.set('jwt_token', data.authResponse.token);
                    setIsLoading(false);
                    success('You are Logged in Successfully');
                } else if (response.status === 400 || response.status === 401) {
                    const errorData = await response.json();
                    setIsLoading(false);
                    const errorMessage = errorData.message || 'Please check the credentials';
                    error(errorMessage);
                } else if (response.status === 403) {
                    const errorData = await response.json();
                    const errorMessage = errorData.message;
                    error(errorMessage);
                }
            } catch (err) {
                setIsLoading(false);
                error(err.message || 'An unexpected error occurred');
            }
        }
    };

    const checktheCredentials = (details) => {
        let errorObject = {};
        if (!details.accountNumber) {
            errorObject.msg = 'Account number should not be empty';
        }       
        return errorObject;
    };

    const checkCredentialsBeforeToSendToDB = (e) => {
        e.preventDefault();
        let errorMessage = checktheCredentials(credentials);
        sendCredentialsToDB(errorMessage);
        setCredentialsError(errorMessage);
    };

    return (
        <div className="authuntication-main">
            <form className="login-in-form" onSubmit={checkCredentialsBeforeToSendToDB}>   
            {credentialsError.msg && <h4 className="error-msg">{credentialsError.msg}</h4>}         
                <div className="input-field-container">
                    <label htmlFor="accountNumber">Account Number <span className="mandatory">*</span></label><br />
                    <input
                        list="account"
                        id="accountNumber"
                        name="accountNumber"
                        onChange={handleChange}
                        placeholder="Account Number"
                        value={credentials.accountNumber}
                    />
                    <datalist id="account">                        
                        {accountOptions.map((option, index) => (
                            <option key={index} value={option} />
                        ))}
                    </datalist>
                </div>               
                <Button
                    type="submit"
                    className="primary-button"
                    text={isLoading ? "Loading..." : 'Submit'}
                />
            </form>
        </div>
    );
};

export default Authentication;
