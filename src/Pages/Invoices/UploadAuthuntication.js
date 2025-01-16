import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import ToastComponent from '../../Components/Toast';
import Button from '../../Components/Button';
import ApiComponent from '../../Components/API'


const Authentication = () => {
   const Navigate = useNavigate()
   const { success, error } = ToastComponent();
    const [accountNoList, setAccountNoList ]= useState(['account option1', 'account option2']);
    const [accountNumber, setAccountNumber] = useState('');
    const [credentialsError, setCredentialsError] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    

    const handleChange = (e) => {
        setAccountNumber(e.target.value)
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
                body: JSON.stringify(accountNumber),
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
        let errorMessage = checktheCredentials(accountNumber);
        sendCredentialsToDB(errorMessage);
        setCredentialsError(errorMessage);
    };

    

    return (
        <div className="authuntication-main">           
            {accountNoList.length === 0 && (
                <ApiComponent
                method='GET'
                url='api/invoices/all'
                render={(response) => setAccountNoList(response.data)}
                />
            )}
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
                        value={accountNumber}
                    />
                    <datalist id="account">                        
                        {accountNoList.map((option, index) => (
                            <option key={index} value={option} />
                        ))}
                    </datalist>
                </div>               
                <Button
                    type="submit"
                    className="primary-button"
                    text={isLoading ? "Loading..." : 'Submit'}
                    onClick = {()=> Navigate('/Hughesnetwork/Management/Invoices/Upload')}
                />
            </form>
        </div>
    );
};

export default Authentication;
