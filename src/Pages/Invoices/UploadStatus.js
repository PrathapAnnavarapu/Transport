

import React, { useState } from 'react';
import Table from '../../Components/Table'; // Adjust the import path as necessary
import Dropdown from '../../Components/Dropdown';
import { CiCircleCheck } from "react-icons/ci";
import { IoIosCloseCircleOutline } from "react-icons/io"
import { RiProgress5Line } from "react-icons/ri";


const StatusTable = () => {
  const headers = [{ key: 'Invoice ID', label: 'Invoice ID' }, { key: 'Invoice Number', label: 'Invoice Number' }, { key: 'Invoice Date', label: 'Invoice Date' }, { key: 'Status', label: 'Status' }];
  const [statusData, setStatusData] = useState([
    {
      "ACCOUNT_NO": "THD",
      "AMOUNT": 203.13,
      "INVOICE_DATE": "Mon, 13 Jan 2025 14:38:00 GMT",
      "INVOICE_ID": "THD-CORP-REC",
      "INVOICE_NO": "V1-176702348-1",
      "STATUS": "UPLOADED"
    },
    {
      "ACCOUNT_NO": "THD",
      "AMOUNT": 672159.83,
      "INVOICE_DATE": "Tue, 14 Jan 2025 10:04:08 GMT",
      "INVOICE_ID": "THD-SC-REC",
      "INVOICE_NO": "V1-176701485-2",
      "STATUS": "PENDING"
    },
    {
      "ACCOUNT_NO": "THD",
      "AMOUNT": 34759.83,
      "INVOICE_DATE": "Tue, 14 Jan 2025 10:04:08 GMT",
      "INVOICE_ID": "THD-SC-REC",
      "INVOICE_NO": "V1-176701485-2",
      "STATUS": "FAILED"
    }
    // Add more rows as needed
  ]);
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
  ])
  const [accountNumber, setAccountNumber] = useState(null);

  const toConvertUSString = (newInvoiceDate) => {
    if (!(newInvoiceDate instanceof Date)) {
      newInvoiceDate = new Date(newInvoiceDate);
    }
    const month = String(newInvoiceDate.getMonth() + 1).padStart(2, '0');
    const day = String(newInvoiceDate.getDate()).padStart(2, '0');
    const year = newInvoiceDate.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'UPLOADED':
        return 'status-paid';
      case 'PENDING':
        return 'status-in-progress';
      case 'FAILED':
        return 'status-failure';
      default:
        return '';
    }
  };

  const rowData = statusData.map(item => ({
    'Invoice Number': item.INVOICE_NO,
    'Invoice ID': item.INVOICE_ID,
    'Invoice Date': toConvertUSString(item.INVOICE_DATE),
    'Status': (
      <span className={getStatusClass(item.STATUS)}>
        {item.STATUS === 'UPLOADED' && <CiCircleCheck />}
        {item.STATUS === 'PENDING' && <RiProgress5Line />}
        {item.STATUS === 'FAILED' && <IoIosCloseCircleOutline />}
        {` ${item.STATUS}`}
      </span>
    )
  }));









  return (
    <div className='status-container'>
      <div className='account-num-insights-container'>
        <div>
          <select
            className='invoice-status-dropdown'
            id="accountNumber"
            name="accountNumber"
            onChange={(e) => setAccountNumber(e.target.value)}
            value={accountNumber || "All"}  // Set default value to "All"
          >
            <option value="All">All</option>
            {accountNoList.map((option, index) => (
              <option key={index} value={option.ACCOUNT_NO}>
                {option.ACCOUNT_NO}
              </option>
            ))}
          </select>
        </div>
        <div className='insights-container'>
          <div className='insight-1'>
            <h6>Pending</h6>
            <h5>3</h5>
          </div>
          {/* <div className='insight-2'>
          <h6>Cancelled</h6>
          <h5>0</h5>
        </div>  */}
          <div className='insight-4'>
            <h6>Failed</h6>
            <h5>12</h5>
          </div>
          <div className='insight-3'>
            <h6>Uploaded</h6>
            <h5>5</h5>
          </div>
          <div className='insight-5'>
            <h6>Total Invoices</h6>
            <h5>21</h5>
          </div>
        </div>
      </div>
      <div className='status-table-container'>
        <div className='table-container'>
          <Table headers={headers} rowData={rowData} />;
        </div>
      </div>
    </div>
  )
};

export default StatusTable;