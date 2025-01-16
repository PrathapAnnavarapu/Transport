import React, { useState, useMemo } from 'react';
import Popup from '../../Components/Model';
import Button from '../../Components/Button';
import Toast from '../../Components/Toast';
import Table from '../../Components/Table'; // Adjust the import path as necessary
import { useNavigate } from 'react-router-dom';

const Mainmenu = () => {
  const { warn, info, error } = Toast();
  const Navigate = useNavigate()
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkFormat, setBulkFormat] = useState('');
  const [filter, setFilter] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pendingBulkFormat, setPendingBulkFormat] = useState('');
  

  console.log(selectedItems)

  const items = [
    { id: 1, invoiceNo: '23466444', date: '2024-12-01', finalDate: '2024-12-15', orderNo:'9021221438', taxAmount:50 },
    { id: 2, invoiceNo: '89977484', date: '2024-10-02', finalDate: '2024-12-16', orderNo:'9021220770', taxAmount:100 },
    { id: 3, invoiceNo: '45669998', date: '2024-09-03', finalDate: '2024-12-17', orderNo:'9020548452', taxAmount:150 },
    { id: 4, invoiceNo: '67434667', date: '2024-06-01', finalDate: '2024-12-15', orderNo:'7653277', taxAmount:200 },
    { id: 5, invoiceNo: '03523455', date: '2024-08-02', finalDate: '2024-12-16', orderNo:'3495868', taxAmount:250 },
    { id: 6, invoiceNo: '42323566', date: '2024-05-03', finalDate: '2024-12-17', orderNo:'5678900', taxAmount:300 },
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

  const filteredItems = sortedItems.filter(item => item.invoiceNo.includes(filter));

 

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

  const headers = ['Select', 'Invoice Number', 'Invoice ID', 'Invoice Date', 'Invoice Final Date', 'Order No', 'File Format',];

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
    'Invoice Number': item.invoiceNo,
    'Invoice ID': item.id,
    'Order No':item.orderNo,
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


  const uploadAutomation = async () => {
    if (selectedItems.length !== 0) {
        info('Your invoices are uploading, please wait...');
        const url = 'http://127.0.0.1:5000/api/run-test';
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                "Access-Control-Allow-Credentials": "true",
            },
            body: JSON.stringify(selectedItems),
        };

        try {
            const response = await fetch(url, options);

            if (response.ok) {
                const data = await response.json();
                info('You are updated successfully');
            } else if (response.status === 400 || response.status === 401) {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Please check the credentials';
                error(errorMessage);
            }
        } catch (err) {
            error(err.message || 'An unexpected error occurred');
        }
    } else {
        warn("Please select items");
    }
};


return (
    <form className='main-sidemenu'>
      <div className='action-buttons-container'>
        <h3>Account Number : <span style={{ color: 'red' , zIndex:1}}>78074504</span></h3>
        <div>
        <Button type='button' className='secondary-button' text='Close'  onClick={()=> Navigate('/Hughesnetwork/Management/Invoices/Upload/Authuntication')}/>
        <Button type='button' className='secondary-button' text='Upload'  onClick={uploadAutomation} />
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