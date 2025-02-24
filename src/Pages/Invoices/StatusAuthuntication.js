

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Button from '../../Components/Button';
import ApiComponent from '../../Components/API';
import Dropdown from '../../Components/Dropdown';

const StatusAuthentication = () => {
    const Navigate = useNavigate();
    const dispatch = useDispatch();
    const [accountNoList, setAccountNoList] = useState([
        {
            "ACCOUNT_NO": "SPL"
        },
        {
            "ACCOUNT_NO": "ROW"
        },
        {
            "ACCOUNT_NO": "CKN"
        },
        {
            "ACCOUNT_NO": "GLP"
        },        
    ]);
    const [accountNumber, setAccountNumber] = useState(null);
    const [credentialsError, setCredentialsError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const checktheCredentials = (details) => {
        let errorObject = {};
        if (!details) {
            errorObject.msg = 'Account number should not be empty';
        }
        return errorObject;
    };

    const getInvoices = (msg) => {
        if (Object.keys(msg).length === 0) {
            dispatch({ type: 'Add_account_number', payload: accountNumber });
            Navigate('/Hughesnetwork-Management/Invoices/Upload-Status');
        }
    };

    const checkCredentialsBeforeToSendToDB = (e) => {
        e.preventDefault();
        let errorMessage = checktheCredentials(accountNumber);
        setCredentialsError(errorMessage);
        getInvoices(errorMessage);
    };



    return (
        <div className="authuntication-main">
            {accountNoList.length === 0 && (
                <ApiComponent
                    method="GET"
                    url="api/all_account_numbers"
                    render={(response) => response.data && setAccountNoList(response.data)}
                />
            )}
            <form className="invoice-upload-in-form" onSubmit={checkCredentialsBeforeToSendToDB}>
                {credentialsError.msg && <h4 className="error-msg">{credentialsError.msg}</h4>}
                <div className="input-field-container">
                <Dropdown
                    options={accountNoList.map(option => option.ACCOUNT_NO)}
                    className="your-input-class"
                    htmlFor="accountNumber"
                    id="accountNumber"
                    labelClassName="your-label-class"
                    label="Status Account Number"
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Account Number"
                    name="accountNumber"
                    dropDownList="accountNoList"
                    value={accountNumber}
                    mandatory="*"
                    />
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

export default StatusAuthentication;
