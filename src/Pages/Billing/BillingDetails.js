import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Table from '../../Components/Table';
import ApiComponent from '../../Components/API';
import Button from '../../Components/Button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Dropdown from '../../Components/Model';  // Importing the Dropdown component
import Popup from '../../Components/Model'
import ToastComponent from '../../Components/Toast';

const BillingReport = () => {
    const { error, success } = ToastComponent()
    const [billingData, setBillingData] = useState([]);
    const [vehiclesList, setVehiclesList] = useState([]);
    const [tripType, setTripType] = useState('all');
    const [selectedVehicle, setSelectedVehicle] = useState('all');
    const [filter, setFilter] = useState('');
    const [vehicleApiProps, setVehicleApiProps] = useState(null);
    const [billingApiProps, setBillingApiProps] = useState(null);
    const [updatePaymentApiProps, setUpdatePaymentApiProps] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupStartDate, setPopupStartDate] = useState(null);
    const [popupEndDate, setPopupEndDate] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null)
    const [endDate, setEndDate] = useState(null);


    // Fetch billing data
    useEffect(() => {
        const queryParams = new URLSearchParams();
        if (tripType) queryParams.append('trip_type', tripType);
        if (selectedVehicle) queryParams.append('vehicle_id', selectedVehicle);

        setBillingApiProps({
            method: 'GET',
            url: `api/get/billing-report?${queryParams.toString()}`,
            render: (response) => {
                if (response?.data) setBillingData(response.data);
            }
        });
    }, [tripType, selectedVehicle, isPopupOpen]);

    useEffect(() => {
        setVehicleApiProps({
            method: 'GET',
            url: 'api/get/vechile/all',
            render: (response) => {
                if (response && response.data) {
                    setVehiclesList(response.data);
                } else {
                    error('Response or response.data is undefined');
                }
            },
        });
    }, []);

    const filteredItems = useMemo(() => {
        return billingData
            .filter(item =>
                (item.vehicle_owner_name || '').toLowerCase().includes(filter.toLowerCase())
            )
            .filter(item => {
                const date = new Date(item.trip_date);
                if (startDate && date < startDate) return false;
                if (endDate) {
                    const adjustedEndDate = new Date(endDate);
                    adjustedEndDate.setHours(23, 59, 59, 999);
                    if (date > adjustedEndDate) return false;
                }
                return true;
            });
    }, [billingData, filter, startDate, endDate]);

    const headers = [
        { key: 'Trip ID', label: 'Trip ID' },
        { key: 'Trip Type', label: 'Trip Type' },
        { key: 'Shift Date', label: 'Shift Date' },
        { key: 'Pickup/Drop Shift Time', label: 'Pickup/Drop Shift Time' },
        { key: 'Vehicle Number', label: 'Vehicle Number' },
        { key: 'Vehicle Owner', label: 'Vehicle Owner' },
        { key: 'Distance Travelled', label: 'Distance Travelled' },
        { key: 'Fare Amount', label: 'Fare Amount' },
        { key: 'Payment Status', label: 'Payment Status' },
        { key: 'Route Name', label: 'Route Name' },
        { key: 'Billing Mode', label: 'Billing Mode' },
        { key: 'Employee Names', label: 'Employee Names' },       
        { key: 'Trip Scheduled At', label: 'Trip Scheduled At' },
        { key: 'Vehicle Assigned At', label: 'Vehicle Assigned At' },
        { key: 'Trip Started At', label: 'Trip Started At' },
        { key: 'Trip Ended At', label: 'Trip Ended At' }
    ];

    const exportData = filteredItems.map(item => ({
        'Trip ID': item.trip_id,
        'Trip Type': item.trip_type,
        'Vehicle Number': item.vehicle_number,
        'Vehicle Owner': item.vehicle_owner_name,
        'Fare Amount': `₹${item.fare_amount}`,
        'Payment Status': item.status,
        'Distance Travelled': `${item.distance_travelled} Km`,
        'Route Name': item.route_name,
        'Billing Mode': item.billing_mode,
        'Employee Names': item.employees.map(e => e.employee_name).join(', '),
        'Shift Date': item.shift_dates.join(', '),
        'Pickup/Drop Shift Time': item.pickup_times?.join(', ') || item.drop_times?.join(', '),
        'Trip Scheduled At': item.trip_date,
        'Vehicle Assigned At': item.vehicle_assigned_at,
        'Trip Started At': item.trip_started_at,
        'Trip Ended At': item.trip_ended_at,
    }));

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "BillingReport");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(dataBlob, "BillingReport.xlsx");
    };
   

    const handleDropdownChange = (e) => {
        const { name, value } = e.target;
        if (name === 'trip_type') {
            setTripType(value);
        } else if (name === 'vehicle_id') {
            setSelectedVehicle(value);
        }
    };

    const handleUpdatePaymentStatus = useCallback((popupStartDate, popupEndDate, paymentStatus) => {
    if (popupStartDate && popupEndDate && paymentStatus) {
        const normalizedStartDate = new Date(Date.UTC(
            popupStartDate.getFullYear(),
            popupStartDate.getMonth(),
            popupStartDate.getDate()
        ));
        const normalizedEndDate = new Date(Date.UTC(
            popupEndDate.getFullYear(),
            popupEndDate.getMonth(),
            popupEndDate.getDate()
        ));

        if (normalizedStartDate > normalizedEndDate) {
            error('Start date cannot be after end date.');
            return;
        }

        const formattedStartDate = normalizedStartDate.toISOString().split('T')[0];
        const formattedEndDate = normalizedEndDate.toISOString().split('T')[0];

        setUpdatePaymentApiProps({
            method: 'POST',
            url: 'api/billing-reports/bulk-update',
            postData: {
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                status: paymentStatus,
            },
            render: (response) => {
                if (response?.data?.message) {
                    success(response.data.message);
                } else {
                    error('Response is undefined');
                }
                setUpdatePaymentApiProps(null); // Reset to avoid repeated calls
                setPopupStartDate(null)
                setPopupEndDate(null)
                setPaymentStatus(null)
                setIsPopupOpen(false);          // Optionally close popup after success
            },
        });
    } else {
        error('Please select valid start and end dates.');
    }
}, [error, success]);





    return (
        <form className='employess-details-main-container'>
            {vehicleApiProps && <ApiComponent {...vehicleApiProps} />}
            {billingApiProps && <ApiComponent {...billingApiProps} />}
            {updatePaymentApiProps && <ApiComponent {...updatePaymentApiProps} />}

            <div className='action-buttons-container'>
                <button type='button' className='new-button' onClick={() => setIsPopupOpen(true)}>Update Payment Status</button>
                <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
                    <div className='operations-bar'>
                        <DatePicker
                            selected={popupStartDate}
                            onChange={(date) => setPopupStartDate(date)}
                            placeholderText="Start Date"
                            className="date-picker"
                        />
                        <DatePicker
                            selected={popupEndDate}
                            onChange={(date) => setPopupEndDate(date)}
                            placeholderText="End Date"
                            className="date-picker"
                            minDate={popupStartDate} // Ensure end date is not before start date
                        />

                        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className='dropdown'>
                            <option>Select</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                        </select>
                        <Button type="button" text='Update' className='primary-button' onClick={() => handleUpdatePaymentStatus(popupStartDate, popupEndDate, paymentStatus)} />
                    </div>
                </Popup>

                <select value={tripType} onChange={(e) => setTripType(e.target.value)} className='dropdown'>
                    <option value="all">All Trips</option>
                    <option value="pickup">Pickup</option>
                    <option value="drop">Drop</option>
                </select>

                <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className='dropdown'>
                    <option value="all">All Vehicles</option>
                    {vehiclesList.map(v => (
                        <option key={v.id} value={v.id}>{v.vechile_number + " - " + v.vechile_owner_name}</option>
                    ))}
                </select>

                <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    placeholderText="Start Date"
                    className='date-picker'
                />
                <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    placeholderText="End Date"
                    className='date-picker'
                />

                <button onClick={exportExcel} type='button'>
                    <img src='/Images/4373169_excel_logo_logos_icon.png' alt='excel' style={{ width: '20px', height: '20px' }} />
                </button>
            </div>

            <div className='employee-details-list'>
                <div className='table-wrapper'>
                    <div className='table-container'>
                        <Table headers={headers} rowData={exportData} />
                    </div>
                </div>
            </div>
        </form>
    );
};

export default BillingReport;
