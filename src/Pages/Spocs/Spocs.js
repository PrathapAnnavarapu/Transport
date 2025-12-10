import React, { useState, useMemo, useEffect } from 'react';
import Table from '../../Components/Table';
import ApiComponent from '../../Components/API';
import { MdEdit, MdOutlineDeleteOutline } from 'react-icons/md';

import Button from '../../Components/Button';
import AddspocDetails from './AddSpocDetails'; // Import form
import Popup from '../../Components/Model'; // Import modal

const SPOCSList = () => {
    const [employees, setEmployees] = useState([]);
    const [apiProps, setApiProps] = useState(null);
    const [filter, setFilter] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    

    useEffect(() => {
        if (!hasFetched) {
            setApiProps({
                method: 'GET',
                url: 'api/get/spocs/all',
                render: (response) => {
                    if (response?.data) {
                        setEmployees(response.data);
                        setHasFetched(true); // Mark API as fetched
                    }
                }
            });
        }
    }, [hasFetched]);



    const sortedItems = useMemo(() => [...employees], [employees]);

    const filteredItems = Array.isArray(sortedItems)
        ? sortedItems.filter((item) =>
            (item.employee_name?.toLowerCase() || '').includes(filter.toLowerCase())
        )
        : [];

    const headers = [
        { key: 'Action', label: 'Action' },
        { key: 'ID', label: 'Employee ID' },
        { key: 'SPOC Name', label: 'Name' },
        { key: 'Gender', label: 'Gender' },
        { key: 'SPOC Mobile No', label: 'Emp Mobile No' },
        { key: 'SPOC Mail ID', label: 'Emp Mail ID' },
        { key: 'Process', label: 'Process' },
        { key: 'Role', label: 'Role' },
        { key: 'Active Status', label: 'Active Status' },      
    ];

    const rowData = filteredItems.map(item => ({
        'ID': item.spoc_id,
        'SPOC Name': item.spoc_name,
        'Gender': item.gender,
        'SPOC Mobile No': item.spoc_mobile_no,
        'SPOC Mail ID': item.spoc_email,
        'Process': item.process,
        'Role': item.role,
        'Active Status': item.active_status,        
        'Action': (
            <div>
                <button className='edit-action-button'>Add +</button>
                <button className='delete-action-button'><MdOutlineDeleteOutline /></button>
            </div>
        )
    }));

    return (
        <form className='employess-details-main-container'>
            {apiProps && <ApiComponent {...apiProps} />}

            <div className='action-buttons-container'>                
                <input
                    type="text"
                    placeholder="Search Employee name"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className='search-input'
                />
                <Button
                    type='button'
                    text="Add +"
                    onClick={() => setIsPopupOpen(true)}
                    className='primary-button'
                />
            </div>

            <div className='employee-details-list'>
                <div className="table-wrapper">
                    <div className='table-container'>
                        <Table headers={headers} rowData={rowData} />
                    </div>
                </div>
            </div>
            {/* Modal for AddEmployeeDetails */}
            <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} >
                <AddspocDetails />
            </Popup>
        </form>
    );
};

export default SPOCSList;
