

import React from 'react';
import Table from '../../Components/Table'; // Adjust the import path as necessary

const StatusTable = () => {
  const headers = [{key:'Account Number', label:'Account Number'},{key:'Invoice ID', label:'Invoice ID'}, {key:'Invoice Number', label:'Invoice Number'}, {key:'Invoice Date', label:'Invoice Number'}, {key:'Status', label:'Invoice Number'}];
  const rowData = [
    {
      'Account Number': '123456',
      'Invoice Number': 'INV001',
      'Invoice Date': '2024-12-01',
      'Invoice ID': '001',
      'Status': 'Paid'
    },
    {
      'Account Number': '789012',
      'Invoice Number': 'INV002',
      'Invoice Date': '2024-12-05',
      'Invoice ID': '002',
      'Status': 'Pending'
    },
    // Add more rows as needed
  ];

  return (
  <div className='status-container'>
     <div className='insights-container'>
        <div className='insight-1'>
          <h6>Pending</h6>
          <h5>3</h5>
        </div>
        {/* <div className='insight-2'>
          <h6>Cancelled</h6>
          <h5>0</h5>
        </div> */}
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
      <div className='status-table-container'>
      <div className='table-container'>
         <Table headers={headers} rowData={rowData}/>;
      </div>
      </div>
  </div>
)};

export default StatusTable;