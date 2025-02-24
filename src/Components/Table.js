import React, { useState } from 'react';

const Table = ({ headers, rowData }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

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

  const sortedData = React.useMemo(() => {
    let sortableItems = [...rowData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [rowData, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <table>
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index} onClick={() => requestSort(header.key)}>
              {header.label}
              {sortConfig.key === header.key ? (sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽') : null}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {headers.map((header, colIndex) => (
              <td key={colIndex} className={header.key === 'Status' ? getStatusClass(row[header.key]) : ''}>
                {row[header.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;