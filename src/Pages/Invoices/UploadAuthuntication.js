import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Button from '../../Components/Button';
import ApiComponent from '../../Components/API';

const Authentication = () => {
    const Navigate = useNavigate();
    const dispatch = useDispatch();    
    const [accountNoList, setAccountNoList] = useState([]);
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
            Navigate('/Hughesnetwork/Management/Invoices/Upload');
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
                    render={(response) => { response.data && setAccountNoList(response.data) }}
                />
            )}
            <form className="invoice-upload-in-form" onSubmit={checkCredentialsBeforeToSendToDB}>
                {credentialsError.msg && <h4 className="error-msg">{credentialsError.msg}</h4>}
                <div className="input-field-container">
                    <label htmlFor="accountNumber">Account Number <span className="mandatory">*</span></label><br />
                    <input
                        list="accountNoList"
                        id="accountNumber"
                        name="accountNumber"
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Account Number"
                        value={accountNumber}
                    />
                    <datalist id="accountNoList">
                        {(Array.isArray(accountNoList) ? accountNoList : []).map((option, index) => (
                            <option key={index} value={option.ACCOUNT_NO} />
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
