import React, { useState, useMemo } from 'react';
import Popup from '../Components/Model';
import Button from '../Components/Button';

const Mainmenu = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bulkFormat, setBulkFormat] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filter, setFilter] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pendingBulkFormat, setPendingBulkFormat] = useState('');

  console.log(pendingBulkFormat)

  const items = [
    { id: 1, name: '23466444', date: '2024-12-01', finalDate: '2024-12-15' },
    { id: 2, name: '89977484', date: '2024-10-02', finalDate: '2024-12-16' },
    { id: 3, name: '45669998', date: '2024-09-03', finalDate: '2024-12-17' },
    { id: 5, name: '23466444', date: '2024-12-01', finalDate: '2024-12-15' },
    { id: 6, name: '89977484', date: '2024-07-02', finalDate: '2024-12-16' },
    { id: 7, name: '45669998', date: '2024-05-03', finalDate: '2024-12-17' },
    { id: 8, name: '23466444', date: '2024-04-01', finalDate: '2024-12-15' },
    { id: 9, name: '89977484', date: '2024-03-02', finalDate: '2024-12-16' },
  ];

  const toConvertUSString = (newInvoiceDate) => {
    if (!(newInvoiceDate instanceof Date)) {
      newInvoiceDate = new Date(newInvoiceDate);
    }
    const month = String(newInvoiceDate.getMonth() + 1).padStart(2, '0');
    const day = String(newInvoiceDate.getDate()).padStart(2, '0');
    const year = newInvoiceDate.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
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
  }, [items, sortConfig]);

  const filteredItems = sortedItems.filter(item =>
    item.name.includes(filter) || item.date.includes(filter) || item.finalDate.includes(filter)
  );

  const requestSort = key => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      const allItems = items.map(item => ({ ...item, fileFormat: bulkFormat }));
      setSelectedItems(allItems);
      setErrorMessage('');
    }
    setSelectAll(!selectAll);
  };

  const handleCheckboxChange = (item) => {
    const existingItem = selectedItems.find(selectedItem => selectedItem.id === item.id);
    if (existingItem) {
      setSelectedItems(selectedItems.filter(selectedItem => selectedItem.id !== item.id));
    } else {
      if (item.fileFormat) {
        setSelectedItems([...selectedItems, item]);
        setErrorMessage('');
      } else {
        setErrorMessage('Please select a file format.');
      }
    }
  };

  const handleChangeOption = (e, id) => {
    const newFormat = e.target.value;
    const item = items.find(item => item.id === id);
    const updatedItem = { ...item, fileFormat: newFormat };
    const updatedItems = selectedItems.map(item =>
      item.id === id ? updatedItem : item
    );
    if (!updatedItems.find(item => item.id === id)) {
      updatedItems.push(updatedItem);
    }
    setSelectedItems(updatedItems);
    setErrorMessage('');
  };

  const handleBulkFormatChange = (e) => {
    const newFormat = e.target.value;
    setPendingBulkFormat(newFormat);
    setIsPopupOpen(true);
  };

  const handleConfirmBulkSelection = () => {
    setBulkFormat(pendingBulkFormat);
    const updatedItems = items.map(item => ({ ...item, fileFormat: pendingBulkFormat }));
    setSelectedItems(updatedItems);
    setErrorMessage('');
    setIsPopupOpen(false);
  };

  return (
    <form className='main-sidemenu'>
      <h3>Account Number : <span>78074504</span></h3>
      <input
        type="text"
        placeholder="Filter..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className='search-input'
      />
      <div className='invoice-numbers-list'>
        <div className='bulk-selection-container'>
          <h4>Bulk Selection of File Format:</h4>
          <div>
            <input
              type='radio'
              name='bulkFormat'
              value='Excel'
              checked={bulkFormat === 'Excel'}
              onChange={handleBulkFormatChange}
            />
            <label>Excel</label>
          </div>
          <div>
            <input
              type='radio'
              name='bulkFormat'
              value='PDF'
              checked={bulkFormat === 'PDF'}
              onChange={handleBulkFormatChange}
            />
            <label>PDF</label>
          </div>
        </div>

        <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
          <h6 className='pop-up-text'>Do you want to select {pendingBulkFormat} to all?</h6>
          <div className='status-buttons'>
            <Button type='button' className='primary-button' text='Yes' onClick={handleConfirmBulkSelection} />
            <Button type='button' className='primary-button' text='No' onClick={() => setIsPopupOpen(false)} />
          </div>
        </Popup>

        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th onClick={() => requestSort('name')}>Invoice Number</th>
              <th>Invoice ID</th>
              <th onClick={() => requestSort('date')}>Invoice Date</th>
              <th onClick={() => requestSort('finalDate')}>Invoice Final Date</th>
              <th>File Format</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedItems.some(selectedItem => selectedItem.id === item.id)}
                    onChange={() => handleCheckboxChange(item)}
                    className='checkbox-class'
                    disabled={!selectedItems.find(selectedItem => selectedItem.id === item.id)?.fileFormat}
                  />
                </td>
                <td>{item.name}</td>
                <td></td>
                <td>{toConvertUSString(item.date)}</td>
                <td>{toConvertUSString(item.finalDate)}</td>
                <td>
                  <div className='radio-buttons-container'>
                    <div>
                      <input
                        type='radio'
                        name={`option-${item.id}`}
                        value='Excel'
                        checked={selectedItems.find(selectedItem => selectedItem.id === item.id)?.fileFormat === 'Excel'}
                        onChange={(e) => handleChangeOption(e, item.id)}
                      />
                      <label>Excel</label>
                    </div>
                    <div>
                      <input
                        type='radio'
                        name={`option-${item.id}`}
                        value='PDF'
                        checked={selectedItems.find(selectedItem => selectedItem.id === item.id)?.fileFormat === 'PDF'}
                        onChange={(e) => handleChangeOption(e, item.id)}
                      />
                      <label>PDF</label>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {errorMessage && <p className='error-message'>{errorMessage}</p>}
      </div>
    </form>
  );
};

export default Mainmenu;