import React, { useState, useMemo } from 'react';
import Popup from '../../Components/Model';
import Button from '../../Components/Button';
import Toast from '../../Components/Toast';
import Table from '../../Components/Table'; // Adjust the import path as necessary
import { useNavigate } from 'react-router-dom';
// import './StatusTable.css'; // Import the CSS file for status styling

const Mainmenu = () => {
  const { warn } = Toast();
  const Navigate = useNavigate()
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkFormat, setBulkFormat] = useState('');
  const [filter, setFilter] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pendingBulkFormat, setPendingBulkFormat] = useState('');

  const items = [
    { id: 1, name: '23466444', date: '2024-12-01', finalDate: '2024-12-15'  },
    { id: 2, name: '89977484', date: '2024-10-02', finalDate: '2024-12-16' },
    { id: 3, name: '45669998', date: '2024-09-03', finalDate: '2024-12-17' },
    { id: 4, name: '67434667', date: '2024-06-01', finalDate: '2024-12-15'  },
    { id: 5, name: '03523455', date: '2024-08-02', finalDate: '2024-12-16' },
    { id: 6, name: '42323566', date: '2024-05-03', finalDate: '2024-12-17' },
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
    return sortableItems;
  }, [items]);

  const filteredItems = sortedItems.filter(item => item.name.includes(filter));

 

  const handleCheckboxChange = (item) => {
    const existingItem = selectedItems.find(selectedItem => selectedItem.id === item.id);
    if (existingItem) {
      setSelectedItems(selectedItems.filter(selectedItem => selectedItem.id !== item.id));
    } else {
      if (item.fileFormat) {
        setSelectedItems([...selectedItems, item]);
      } else {
        warn('Please select a file format.');
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
    setIsPopupOpen(false);
  };

  const headers = ['Select', 'Invoice Number', 'Invoice ID', 'Invoice Date', 'Invoice Final Date', 'File Format'];

  const rowData = filteredItems.map(item => ({
    'Select': (
      <input
        type="checkbox"
        checked={selectedItems.some(selectedItem => selectedItem.id === item.id)}
        onChange={() => handleCheckboxChange(item)}
        className='checkbox-class'
        disabled={!selectedItems.find(selectedItem => selectedItem.id === item.id)?.fileFormat}
      />
    ),
    'Invoice Number': item.name,
    'Invoice ID': item.id,
    'Invoice Date': toConvertUSString(item.date),
    'Invoice Final Date': toConvertUSString(item.finalDate),   
    'File Format': (
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
    )
  }));

  return (
    <form className='main-sidemenu'>
      <div className='action-buttons-container'>
        <h3>Account Number : <span style={{ color: 'red' , zIndex:1}}>78074504</span></h3>
        <div>
        <Button type='button' className='secondary-button' text='Close'  onClick={()=> Navigate('/Hughesnetwork/Management/Invoices/Upload/Authuntication')}/>
        <Button type='button' className='secondary-button' text='Upload' />
        </div>
      </div>
      <input
        type="text"
        placeholder="Search invoice number..."
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
        <div className='table-container'>
          <Table headers={headers} rowData={rowData} />
        </div>
      </div>
    </form>
  );
};

export default Mainmenu;