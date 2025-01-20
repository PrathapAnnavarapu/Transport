import React, { useState, useMemo, useEffect } from 'react';
import Popup from '../../Components/Model';
import Button from '../../Components/Button';
import Table from '../../Components/Table';
import Toast from '../../Components/Toast';
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
  const [apiProps, setApiProps] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // New loading state
  const [selectAll, setSelectAll] = useState(false);
  const [invoices, setInvoices] = useState([]);

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
    return [...invoices];
  }, [invoices]);

  const filteredItems = Array.isArray(sortedItems)
    ? sortedItems.filter((item) => (item.INVOICE_NO || '').includes(filter))
    : [];

  const handleCheckboxChange = (item) => {
    const existingItem = selectedItems.find(selectedItem => selectedItem.INVOICE_NO === item.INVOICE_NO);
    if (existingItem) {
      setSelectedItems(selectedItems.filter(selectedItem => selectedItem.INVOICE_NO !== item.INVOICE_NO));
    } else {
      if (item.FILE_FORMAT) {
        setSelectedItems([...selectedItems, item]);
      } else {
        warn('Please select a file format.');
      }
    }
  };

  const handleChangeOption = (e, INVOICE_NO) => {
    const newFormat = e.target.value;
    const item = invoices.find(item => item.INVOICE_NO === INVOICE_NO);
    const updatedItem = { ...item, FILE_FORMAT: newFormat, ACCOUNT_NO: accountNumber };
    const updatedItems = selectedItems.map(item =>
      item.INVOICE_NO === INVOICE_NO ? updatedItem : item
    );
    if (!updatedItems.find(item => item.INVOICE_NO === INVOICE_NO)) {
      updatedItems.push(updatedItem);
    }
    setSelectedItems(updatedItems);
  };

  const handleBulkFormatChange = (e) => {
    const newFormat = e.target.value;
    setPendingBulkFormat(newFormat);
  };

  const handleConfirmBulkSelection = () => {
    setBulkFormat(pendingBulkFormat);
    const updatedItems = invoices.map(item => ({ ...item, FILE_FORMAT: pendingBulkFormat }));
    setSelectedItems(updatedItems);
    setIsPopupOpen(false);
    setSelectAll(true); // Ensure the "Select All" checkbox stays checked after confirmation
  };

  const handleSelectAllChange = () => {
    if (!selectAll) {
      setIsPopupOpen(true); // Open the popup to select the file format
    } else {
      setSelectedItems([]); // Uncheck all items if "Select All" is unchecked
      setSelectAll(false);
    }
  };

  const headers = [
    { key: 'Select', label: <input type="checkbox" checked={selectAll} onChange={handleSelectAllChange} /> },
    { key: 'Invoice Number', label: 'Invoice Number' },
    { key: 'Invoice ID', label: 'Invoice ID' },
    { key: 'Invoice Date', label: 'Invoice Date' },
    { key: 'File Format', label: 'File Format' }
  ];

  const rowData = filteredItems.map(item => ({
    'Select': (
      <input
        type="checkbox"
        checked={selectedItems.some(selectedItem => selectedItem.INVOICE_NO === item.INVOICE_NO)}
        onChange={() => handleCheckboxChange(item)}
        className="checkbox-class"
        disabled={!selectedItems.find(selectedItem => selectedItem.INVOICE_NO === item.INVOICE_NO)?.FILE_FORMAT} // Disable if no format is selected
      />
    ),
    'Invoice Number': item.INVOICE_NO,
    'Invoice ID': item.INVOICE_NO,
    'Invoice Date': toConvertUSString(item.INVOICE_DATE),
    'File Format': (
      <div className='radio-buttons-container'>
        <div>
          <input
            type='radio'
            name={`option-${item.INVOICE_NO}`}
            value='Excel'
            checked={selectedItems.find(selectedItem => selectedItem.INVOICE_NO === item.INVOICE_NO)?.FILE_FORMAT === 'Excel'}
            onChange={(e) => handleChangeOption(e, item.INVOICE_NO)}
          />
          <label>Excel</label>
        </div>
        <div>
          <input
            type='radio'
            name={`option-${item.INVOICE_NO}`}
            value='PDF'
            checked={selectedItems.find(selectedItem => selectedItem.INVOICE_NO === item.INVOICE_NO)?.FILE_FORMAT === 'PDF'}
            onChange={(e) => handleChangeOption(e, item.INVOICE_NO)}
          />
          <label>PDF</label>
        </div>
      </div>
    )
  }));

  const handleUploadTheInvoiceApiResponse = (response) => {
    setIsUploading(false); // Reset loading state
    if (response.status === 200) {
      success('Invoices are uploaded successfully');
    } else if (response.status === 400) {
      error(response.data.message || 'Failed to upload invoices');
    }
  };

  const uploadAutomation = async () => {
    setIsUploading(true);
    if (selectedItems.length !== 0 && isUploading === true) { // Prevent multiple uploads
      info('Your invoices are uploading, please wait...');

      setApiProps({
        method: 'POST',
        url: 'api/save_invoice',
        postData: selectedItems,
        render: handleUploadTheInvoiceApiResponse,
      });
    } else {
      setIsUploading(false);
      error('Upload is failed');
    }
  };

  return (
    <form className='main-sidemenu'>
      {apiProps && <ApiComponent {...apiProps} />}
      {invoices.length === 0 && (
        <ApiComponent
          method='GET'
          url={`api/invoices/${accountNumber}`}
          render={(response) => { response.data && setInvoices(response.data) }}
        />
      )}
      <div className='action-buttons-container'>
        <h3>Account Number : <span style={{ color: 'red', zIndex: 1 }}>{accountNumber}</span></h3>
        <div>
          <Button type='button' className='secondary-button' text='Close' onClick={() => { dispatch({ type: 'Clear_account_number' }); Navigate('/Hughesnetwork/Management/Invoices/Upload/Authuntication') }} />
          <Button type='button' className='secondary-button' text='Upload' onClick={uploadAutomation} />
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
        <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
          <h4>Please select a file format for all invoices</h4>
          <div className='bulk-selection-container'>
            <div>
              <input
                type='radio'
                name='bulkFormat'
                value='Excel'
                checked={pendingBulkFormat === 'Excel'}
                onChange={handleBulkFormatChange}
              />
              <label>Excel</label>
            </div>
            <div>
              <input
                type='radio'
                name='bulkFormat'
                value='PDF'
                checked={pendingBulkFormat === 'PDF'}
                onChange={handleBulkFormatChange}
              />
              <label>PDF</label>
            </div>
          </div>
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
