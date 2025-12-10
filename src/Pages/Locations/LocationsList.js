import React, { useState, useMemo, useEffect } from 'react';
import Table from '../../Components/Table';
import ApiComponent from '../../Components/API';
import { MdEdit, MdOutlineDeleteOutline } from 'react-icons/md';

import Button from '../../Components/Button';
import AddLocationDetails from './AddLocationDetails'; // location form
import Popup from '../../Components/Model'; // modal
import ToastComponent from '../../Components/Toast';

const Locations = () => {
    const { success, error } = ToastComponent();
    const [locationsList, setLocationsList] = useState([]);
    const [apiProps, setApiProps] = useState(null);
    const [filter, setFilter] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);

    // ✅ Fetch locations once (or when refresh triggered)
    useEffect(() => {
        if (!hasFetched) {
            setApiProps({
                method: 'GET',
                url: 'api/locations/all',
                render: (response) => {
                    if (response?.data) {
                        setLocationsList(response.data);
                        setHasFetched(true); // prevent refetch loop
                    }
                },
                catchError: (err) => {
                    error(err?.response?.data?.error || 'Failed to fetch locations');
                }
            });
        }
    }, [hasFetched]);

    // ✅ Sorting + filtering
    const sortedItems = useMemo(() => [...locationsList], [locationsList]);

    const filteredItems = Array.isArray(sortedItems)
        ? sortedItems.filter((item) =>
            (item.location_name?.toLowerCase() || '').includes(filter.toLowerCase())
        )
        : [];

    // ✅ Table headers
    const headers = [
        { key: 'Action', label: 'Action' },
        { key: 'ID', label: 'Location ID' },
        { key: 'Name', label: 'Location Name' },
        { key: 'Code', label: 'Location Code' },
        { key: 'Address', label: 'Address' },
        { key: 'City', label: 'City' },
        { key: 'State', label: 'State' },
        { key: 'Country', label: 'Country' },
        { key: 'Active Status', label: 'Active Status' },
    ];

    // ✅ Edit handler
    const handleEditLocation = (item) => {
        setSelectedLocation(item);
        setIsPopupOpen(true);
    };

    // ✅ Delete handler
    const handleDeleteLocation = (locationId) => {
        setApiProps({
            method: 'DELETE',
            url: `api/locations/delete/${locationId}`, // fixed to locations endpoint
            render: (response) => {
                if (response?.data) {
                    success(response.data.message || 'Location deleted successfully');
                    setHasFetched(false); // refresh list
                }
            },
            catchError: (err) => {
                error(err?.response?.data?.error || 'Failed to delete location');
            }
        });
    };

    // ✅ Table rows
    const rowData = filteredItems.map(item => ({
        'ID': item.id,
        'Name': item.location_name,
        'Code': item.location_code,
        'Address': item.address,
        'City': item.city,
        'State': item.state,
        'Country': item.country,
        'Active Status': item.is_active ? 'Active' : 'Inactive',
        'Action': (
            <div>
                <button
                    type="button"
                    className='edit-action-button'
                    onClick={() => handleEditLocation(item)}
                >
                    <MdEdit />
                </button>
                <button
                    type="button"
                    className='delete-action-button'
                    onClick={() => handleDeleteLocation(item.id)}
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
                    placeholder="Search location name"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className='search-input'
                />
                <Button
                    type='button'
                    text="Add +"
                    onClick={() => { setSelectedLocation(null); setIsPopupOpen(true); }}
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

            {/* Modal for AddLocationDetails */}
            <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} specialClass={true}>
                <AddLocationDetails
                    location={selectedLocation}  // ✅ renamed prop to match AddLocationDetails
                    onSuccess={() => {
                        setIsPopupOpen(false);
                        setHasFetched(false); // ✅ triggers refetch
                    }}
                />
            </Popup>
        </form>
    );
};

export default Locations;
