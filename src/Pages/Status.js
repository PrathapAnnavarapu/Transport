

import React from 'react';
import Table from '../Components/Table'; // Adjust the import path as necessary

const StatusTable = () => {
  const headers = ['Account Number','Invoice ID', 'Invoice Number', 'Invoice Date', 'Status'];
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
      <Table headers={headers} rowData={rowData} />;
  </div>
)};

export default StatusTable;