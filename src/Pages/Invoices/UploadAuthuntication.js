import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ToastComponent from '../../Components/Toast';
import Button from '../../Components/Button';
import ApiComponent from '../../Components/API';

const Authentication = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { success, error } = ToastComponent();
  const [accountNoList, setAccountNoList] = useState([]);
  const [accountNumber, setAccountNumber] = useState('');
  const [credentialsError, setCredentialsError] = useState({});
  const [isLoading, setIsLoading] = useState(false); 

  useEffect(() => {
    const fetchAccountNumbers = async () => {
      try {
        const response = await fetch('api/all_account_numbers');
        const data = await response.json();
        console.log('Fetched data:', data); // Debugging line
        setAccountNoList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch account numbers', err);
      }
    };

    fetchAccountNumbers();
  }, []);

  const checkTheCredentials = (details) => {
    let errorObject = {};
    if (!details) {
      errorObject.msg = 'Account number should not be empty';
    }
    return errorObject;
  };

  const getInvoices = (msg) => {
    if (Object.keys(msg).length === 0) {
      console.log(accountNumber);
      dispatch({ type: 'Add_account_number', payload: accountNumber });
      navigate('/Hughesnetwork/Management/Invoices/Upload');
    }
  };

  const checkCredentialsBeforeToSendToDB = (e) => {
    e.preventDefault();
    let errorMessage = checkTheCredentials(accountNumber);
    setCredentialsError(errorMessage);
    getInvoices(errorMessage);
  };

  return (
    <div className="authentication-main">
      <form className="login-in-form" onSubmit={checkCredentialsBeforeToSendToDB}>
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
            {accountNoList.map((option, index) => (
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
