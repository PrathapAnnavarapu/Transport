import React, { useState, useMemo, useEffect } from 'react';
import Table from '../../Components/Table';
import ApiComponent from '../../Components/API';
import { MdEdit, MdOutlineDeleteOutline } from 'react-icons/md';

import Button from '../../Components/Button';
import AddEmployeeDetails from './AddMainEmployee'; // Import form
import Popup from '../../Components/Model'; // Import modal
import ToastComponent from '../../Components/Toast';

const Employess = () => {
    const { success } = ToastComponent()
    const [employees, setEmployees] = useState([]);
    const [apiProps, setApiProps] = useState(null);
    const [filter, setFilter] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);


    useEffect(() => {
        setApiProps({
            method: 'GET',
            url: 'api/employees/all',
            render: (response) => {
                if (response?.data) {
                    console.log(response)
                    setEmployees(response.data);
                }
            }
        });
    }, []);




    const sortedItems = useMemo(() => [...employees], [employees]);

    const filteredItems = Array.isArray(sortedItems)
        ? sortedItems.filter((item) =>
            (item.employee_name?.toLowerCase() || '').includes(filter.toLowerCase())
        )
        : [];



    const headers = [
        { key: 'Action', label: 'Action' },
        { key: 'ID', label: 'Employee ID' },
        { key: 'Name', label: 'Name' },
        { key: 'Gender', label: 'Gender' },
        { key: 'Emp Mobile No', label: 'Emp Mobile No' },
        { key: 'Emp Mail ID', label: 'Emp Mail ID' },
        { key: 'Process', label: 'Process' },
        { key: 'Role', label: 'Role' },
        { key: 'Active Status', label: 'Active Status' },
        { key: 'POC Name', label: 'POC Name' },
        { key: 'POC No', label: 'POC No' },
        { key: 'Work Location', label: 'Work Location' },
        { key: 'Emp Address', label: 'Emp Address' }
    ];

    const handleEditEmployee = (item) => {
        setSelectedEmployee(item)
        setIsPopupOpen(true)
    }

    const handleDeleteEmployee = (employeeId) => {
        setApiProps({
            method: 'DELETE',
            url: `api/users/delete/${employeeId}`,
            render: (response) => {
                if (response?.data) {
                    success(response.data.message);
                }
            }
        });
    }

    const rowData = filteredItems.map(item => ({
        'ID': item.employee_id,
        'Name': item.employee_name,
        'Gender': item.gender,
        'Emp Mobile No': item.employee_mobile_no,
        'Emp Mail ID': item.employee_email,
        'Process': item.process,
        'Role': item.role,
        'Active Status': item.active_status,
        'Emp Address': item.employee_address,
        'Work Location': item.work_location,
        'POC Name': item.poc_name,
        'POC No': item.poc_mobile_no,
        'Action': (
            <div>
                <button
                    type="button"
                    className='edit-action-button'
                    onClick={() => handleEditEmployee(item)}
                >
                    <MdEdit />
                </button>
                <button
                    type="button"
                    className='delete-action-button'
                    onClick={() => handleDeleteEmployee(item.employee_id)}
                >
                    <MdOutlineDeleteOutline />
                </button>
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
                    onClick={() => { setSelectedEmployee(null); setIsPopupOpen(true) }}
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
            <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} specialClass={true}>
                <AddEmployeeDetails
                    employee={selectedEmployee}
                    onSuccess={() => {
                        setIsPopupOpen(false);
                        setHasFetched(false);
                    }}
                />
            </Popup>
        </form>
    );
};

export default Employess;
