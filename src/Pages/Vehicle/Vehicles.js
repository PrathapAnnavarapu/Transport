import React, { useState, useMemo, useEffect } from 'react';
import Table from '../../Components/Table';
import { useNavigate } from 'react-router-dom';
import ApiComponent from '../../Components/API'
import { MdEdit, MdOutlineDeleteOutline } from 'react-icons/md';
import Popup from '../../Components/Model'
import VehicleDetails from './AddMainVechiles'
import { WrapText } from 'lucide-react';
import Button from '../../Components/Button';


const Vehicles = () => {
    const navigate = useNavigate()
    const [vehicles, setVehicles] = useState([]);
    const [apiProps, setApiProps] = useState(null);
    const [filter, setFilter] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    

    useEffect(() => {
        // Fetch schedules if not already loaded        
        setApiProps({
            method: 'GET',
            url: 'api/get/vechile/all',
            render: (response) => {
                if (response && response.data) {
                    setVehicles(response.data);
                } else {
                    console.error('Response or response.data is undefined');
                }
            }
        });        
    }, [isPopupOpen]);



    const sortedItems = useMemo(() => {
        return [...vehicles];
    }, [vehicles]);


    const filteredItems = Array.isArray(sortedItems) ?
        sortedItems.filter((item) => ((item.vechile_owner_name).toLowerCase() || '').includes(filter.toLowerCase())) : [];



    const headers = [
        { key: 'Action', label: 'Action' },
        { key: 'vendor Name', label: 'vendor Name' },
        { key: 'Vehicle Owner Name', label: 'Vehicle Owner Name' },
        { key: 'Owner Mobile No', label: 'Owner Mobile No' },
        { key: 'Driver Mobile No', label: 'Driver Mobile No' },
        { key: 'Vehicle Name', label: 'Vehicle Name' },
        { key: 'Vehicle Model', label: 'Vehicle Model' },
        { key: 'Billing Type', label: 'Billing Type' },
        { key: 'Vehicle Registration Number', label: 'Vehicle Registration Number' },
        { key: 'Owner Address', label: 'Owner Address' }
    ];

    const rowData = filteredItems.map(item => ({
        'vendor Name': item.vendor_name,
        'Vehicle Owner Name': item.vechile_owner_name,
        'Owner Mobile No': item.vechile_owner_mobile_no,
        'Driver Mobile No': item.vechile_driver_mobile_no,
        'Vehicle Name': item.vechile_name,
        'Vehicle Model': item.vechile_model,
        'Vehicle Registration Number': item.vechile_number,
        'Owner Address': item.vechile_owner_address,
        'Billing Type': item.billing_mode,
        'Action': (<div><button className='edit-action-button'><MdEdit /></button><button className='delete-action-button'><MdOutlineDeleteOutline /></button></div>)
    }));


    return (
        <form className='employess-details-main-container'>
            {apiProps && <ApiComponent {...apiProps} />}
            <div className='action-buttons-container'>
                <input
                    type="text"
                    placeholder="Search Vehicle"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className='search-input' />
                <Button type='button' text="Add +"  onClick={() => setIsPopupOpen(true)} className='primary-button' />
            </div>
            <div className='employee-details-list'>
                <div class="table-wrapper">
                    <div className='table-container'>
                        <Table headers={headers} rowData={rowData} />
                    </div>
                </div>
                 <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} specialClass={true}>
                    <VehicleDetails setIsPopupOpen={setIsPopupOpen} />
                </Popup>
            </div>
        </form>
    );
};

export default Vehicles;
