import React, { useState, useEffect, useMemo } from 'react';

const Table = ({ headers, rowData }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('currentPage');
    return savedPage ? parseInt(savedPage, 10) : 1;
  });

  const rowsPerPage = 100;

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

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

  const sortedData = useMemo(() => {
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

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(rowData.length / rowsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="table-container">
      <div className="table-scrollable">
        <div className="table-wrapper">
          <table className="custom-table">
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
              {paginatedData.map((row, rowIndex) => (
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
        </div>
      </div>

      {/* ✅ Fixed pagination outside scrollable area */}
      <div className="pagination full-width-pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        {[...Array(totalPages).keys()].map((page) => (
          <button
            key={page + 1}
            onClick={() => handlePageChange(page + 1)}
            className={page + 1 === currentPage ? 'active' : ''}
          >
            {page + 1}
          </button>
        ))}
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Table;
