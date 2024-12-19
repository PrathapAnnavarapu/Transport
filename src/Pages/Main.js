import React, { useState, useMemo } from 'react';
import Popup from '../Components/Model';
import Button from '../Components/Button';
import Toast from '../Components/Toast';
import GridApi from '../Components/AgGrid'; // Import your GridMultiselection component

const Mainmenu = () => {
  const { warn } = Toast();

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkFormat, setBulkFormat] = useState('');
  const [filter, setFilter] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pendingBulkFormat, setPendingBulkFormat] = useState('');

  const items = [
    { id: 1, name: '23466444', date: '2024-12-01', finalDate: '2024-12-15' },
    { id: 2, name: '89977484', date: '2024-10-02', finalDate: '2024-12-16' },
    { id: 3, name: '45669998', date: '2024-09-03', finalDate: '2024-12-17' },
    { id: 5, name: '23435244', date: '2024-12-01', finalDate: '2024-12-15' },
    { id: 6, name: '89974584', date: '2024-07-02', finalDate: '2024-12-16' },
    { id: 7, name: '45669348', date: '2024-05-03', finalDate: '2024-12-17' },
    { id: 8, name: '23466444', date: '2024-04-01', finalDate: '2024-12-15' },
    { id: 9, name: '89977484', date: '2024-03-02', finalDate: '2024-12-16' },
    { id: 10, name: '45679998', date: '2024-05-03', finalDate: '2024-12-17' },
    { id: 11, name: '23786444', date: '2024-04-01', finalDate: '2024-12-15' },
    { id: 12, name: '85677484', date: '2024-03-02', finalDate: '2024-12-16' },
    { id: 10, name: '45663498', date: '2024-05-03', finalDate: '2024-12-17' },
    { id: 11, name: '23411244', date: '2024-04-01', finalDate: '2024-12-15' },
    { id: 12, name: '84609484', date: '2024-03-02', finalDate: '2024-12-16' },
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

  const filteredItems = useMemo(() => {
    return items.filter(item => item.name.includes(filter));
  }, [items, filter]);

  const handleSelectAll = () => {
    if (!bulkFormat) {
      warn('Please select a bulk file format before selecting all.');
      return;
    }
    if (selectAll) {
      setSelectedItems([]);
    } else {
      const allItems = items.map(item => ({ ...item, fileFormat: bulkFormat }));
      setSelectedItems(allItems);
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

  const [rowData, setRowData] = useState(items);
  const [columnDefs, setColumnDefs] = useState([
    { field: "name", headerName: "Invoice Number", minWidth: 150 },
    { field: "id", headerName: "Invoice ID", maxWidth: 90 },
    { field: "date", headerName: "Invoice Date", minWidth: 150 },
    { field: "finalDate", headerName: "Invoice Final Date", minWidth: 150 },
    {
      field: "fileFormat",
      headerName: "File Format",
      cellRendererFramework: (params) => (
        <div className='radio-buttons-container'>
          <div>
            <input
              type='radio'
              name={`option-${params.data.id}`}
              value='Excel'
              checked={params.data.fileFormat === 'Excel'}
              onChange={(e) => handleChangeOption(e, params.data.id)}
            />
            <label>Excel</label>
          </div>
          <div>
            <input
              type='radio'
              name={`option-${params.data.id}`}
              value='PDF'
              checked={params.data.fileFormat === 'PDF'}
              onChange={(e) => handleChangeOption(e, params.data.id)}
            />
            <label>PDF</label>
          </div>
        </div>
      ),
    },
  ]);

  const onGridReady = params => {
    setRowData(items);
  };

  return (
    <form className='main-sidemenu'>
      <div className='action-buttons-container'>
        <h3>Account Number : <span style={{ color: 'red' }}>78074504</span></h3>
        <Button type='button' className='secondary-button' text='Submit' />
      </div>
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
        {/* <div className='table-container'> */}
          <GridApi
            rowData={rowData}
            columnDefs={columnDefs}
          />
        {/* </div> */}
      </div>
    </form>
  );
};

export default Mainmenu;