import React, { useState, useMemo } from 'react';
import Popup from '../../Components/Model';
import Button from '../../Components/Button';
import Toast from '../../Components/Toast';
import Table from '../../Components/Table'; // Adjust the import path as necessary
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ApiComponent from '../../Components/API';

const Mainmenu = () => {
  const dispatch = useDispatch();
  const accountNumber = useSelector((state) => state.Account.accountNumber) || null; 
  const { warn, info, error, success } = Toast();
  const Navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkFormat, setBulkFormat] = useState('');
  const [filter, setFilter] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pendingBulkFormat, setPendingBulkFormat] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [apiProps, setApiProps] = useState(null);

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
    let sortableItems = [...invoices];
    return sortableItems;
  }, [invoices]);

  const filteredItems = sortedItems.filter((item) => item.invoiceNo.includes(filter));

  const handleCheckboxChange = (item) => {
    const existingItem = selectedItems.find((selectedItem) => selectedItem.id === item.id);
    if (existingItem) {
      setSelectedItems(selectedItems.filter((selectedItem) => selectedItem.id !== item.id));
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
    const item = invoices.find((item) => item.id === id);
    const updatedItem = { ...item, fileFormat: newFormat };
    const updatedItems = selectedItems.map((item) => (item.id === id ? updatedItem : item));
    if (!updatedItems.find((item) => item.id === id)) {
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
    const updatedItems = invoices.map((item) => ({ ...item, fileFormat: pendingBulkFormat }));
    setSelectedItems(updatedItems);
    setIsPopupOpen(false);
  };

  const headers = ['Select', 'Invoice Number', 'Invoice ID', 'Invoice Date', 'Invoice Final Date', 'Amount', 'File Format'];

  const rowData = filteredItems.map((item) => ({
    'Select': (
      <input
        type="checkbox"
        checked={selectedItems.some((selectedItem) => selectedItem.id === item.id)}
        onChange={() => handleCheckboxChange(item)}
        className="checkbox-class"
        disabled={!selectedItems.find((selectedItem) => selectedItem.id === item.id)?.fileFormat}
      />
    ),
    'Invoice Number': item.INVOICE_NO,
    'Invoice ID': item.INVOICE_ID,
    'Amount': item.AMOUNT,
    'Invoice Date': toConvertUSString(item.INVOICE_DATE),
    'Invoice Final Date': toConvertUSString(item.finalDate),
    'File Format': (
      <div className="radio-buttons-container">
        <div>
          <input
            type="radio"
            name={`option-${item.id}`}
            value="Excel"
            checked={selectedItems.find((selectedItem) => selectedItem.id === item.id)?.fileFormat === 'Excel'}
            onChange={(e) => handleChangeOption(e, item.id)}
          />
          <label>Excel</label>
        </div>
        <div>
          <input
            type="radio"
            name={`option-${item.id}`}
            value="PDF"
            checked={selectedItems.find((selectedItem) => selectedItem.id === item.id)?.fileFormat === 'PDF'}
            onChange={(e) => handleChangeOption(e, item.id)}
          />
          <label>PDF</label>
        </div>
      </div>
    ),
  }));

  const handleUploadTheInvoiceApiResponse = (response) => {
    if (response.status === 200) {
      success('Invoices are uploaded Successfully');
    } else if (response.status === 400) {
      error(response.data.message || 'Failed to Save Invoices');
    }
  };

  const uploadAutomation = async () => {
    if (selectedItems.length !== 0) {
      info('Your invoices are uploading, please wait...');
      setApiProps({
        method: 'POST',
        url: '/api/run-test',
        postData: selectedItems,
        render: handleUploadTheInvoiceApiResponse,
      });
    }
  };

return (
    <form className='main-sidemenu'>
      {apiProps && <ApiComponent {...apiProps} />}
      {invoices.length === 0 && (
            <ApiComponent
            method='GET'
            url={`api/invoices/${accountNumber}`}
            render={(response) => setInvoices(response.data)}
            />
        )}
      <div className='action-buttons-container'>
        <h3>Account Number : <span style={{ color: 'red' , zIndex:1}}>{accountNumber}</span></h3>
        <div>
        <Button type='button' className='secondary-button' text='Close'  onClick={()=> {dispatch({type:'Clear_account_number'});Navigate('/Hughesnetwork/Management/Invoices/Upload/Authuntication')}}/>
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