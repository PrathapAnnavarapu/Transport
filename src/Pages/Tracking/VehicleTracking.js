import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import ApiComponent from '../../Components/API';
import ToastComponent from '../../Components/Toast';
import Model from '../../Components/Model';
import DatePicker from 'react-datepicker';
import 'leaflet/dist/leaflet.css';
import 'react-datepicker/dist/react-datepicker.css';
import './VehicleTracking.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const VehicleTracking = () => {
    const { info, error, success } = ToastComponent();
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [routeDetails, setRouteDetails] = useState(null);
    const [apiProps, setApiProps] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otpData, setOtpData] = useState({ otp: '', employee_id: null, schedule_id: null });
    const refreshInterval = useRef(null);

    // Vehicle icon (green for active)
    const vehicleIcon = new L.Icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                <circle cx="12" cy="12" r="10" fill="#4CAF50" stroke="white" stroke-width="2"/>
                <path d="M12 8 L12 15 M12 8 L8 12 M12 8 L16 12" stroke="white" stroke-width="2" fill="none"/>
            </svg>
        `),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    // Employee icon (blue)
    const employeeIcon = new L.Icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <circle cx="12" cy="12" r="10" fill="#2196F3" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" fill="white"/>
                <path d="M 6 18 Q 12 14, 18 18" fill="white"/>
            </svg>
        `),
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24]
    });

    // Completed employee icon (gray)
    const completedEmployeeIcon = new L.Icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <circle cx="12" cy="12" r="10" fill="#9E9E9E" stroke="white" stroke-width="2"/>
                <path d="M7 12 L10 15 L17 8" stroke="white" stroke-width="2" fill="none"/>
            </svg>
        `),
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24]
    });

    // Fetch current vehicle locations
    const fetchVehicleLocations = () => {
        const formattedDate = selectedDate.toISOString().split('T')[0];

        setApiProps({
            method: 'GET',
            url: `api/vehicle/tracking/current?date=${formattedDate}`,
            render: (response) => {
                if (response && response.data) {
                    setVehicles(response.data);
                } else {
                    setVehicles([]);
                }
            },
            onError: (err) => {
                error(`Error fetching vehicles: ${err.message || err}`);
            }
        });
    };

    // Fetch specific route details
    const fetchRouteDetails = (clusterId, tripType) => {
        const formattedDate = selectedDate.toISOString().split('T')[0];

        setApiProps({
            method: 'GET',
            url: `api/vehicle/tracking/route/${clusterId}?trip_type=${tripType}&date=${formattedDate}`,
            render: (response) => {
                if (response && response.data) {
                    setRouteDetails(response.data);
                }
            },
            onError: (err) => {
                error(`Error fetching route: ${err.message || err}`);
            }
        });
    };

    // Auto-refresh every 10 seconds
    useEffect(() => {
        fetchVehicleLocations();

        if (autoRefresh) {
            refreshInterval.current = setInterval(() => {
                fetchVehicleLocations();
                if (selectedVehicle?.cluster_id) {
                    fetchRouteDetails(selectedVehicle.cluster_id, selectedVehicle.trip_type);
                }
            }, 10000);
        }

        return () => {
            if (refreshInterval.current) {
                clearInterval(refreshInterval.current);
            }
        };
    }, [autoRefresh, selectedDate, selectedVehicle]);

    // Handle vehicle selection
    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
        if (vehicle.cluster_id) {
            fetchRouteDetails(vehicle.cluster_id, vehicle.trip_type);
        }
    };

    // Handle OTP verification
    const handleOTPSubmit = () => {
        if (!otpData.otp || otpData.otp.length !== 4) {
            error('Please enter a valid 4-digit OTP');
            return;
        }

        setApiProps({
            method: 'POST',
            url: 'api/vehicle/tracking/verify-otp',
            postData: JSON.stringify({
                employee_id: otpData.employee_id,
                schedule_id: otpData.schedule_id,
                otp: otpData.otp,
                trip_type: selectedVehicle?.trip_type || 'pickup'
            }),
            render: (response) => {
                if (response && response.success) {
                    success('Employee picked up successfully!');
                    setShowOTPModal(false);
                    setOtpData({ otp: '', employee_id: null, schedule_id: null });
                    // Refresh data
                    fetchVehicleLocations();
                    if (selectedVehicle?.cluster_id) {
                        fetchRouteDetails(selectedVehicle.cluster_id, selectedVehicle.trip_type);
                    }
                } else {
                    error(response?.message || 'OTP verification failed');
                }
            },
            onError: (err) => {
                error(`Error verifying OTP: ${err.message || err}`);
            }
        });
    };

    // Open OTP modal for employee
    const openOTPModal = (employee) => {
        setOtpData({
            otp: '',
            employee_id: employee.employee_id,
            schedule_id: employee.schedule_id
        });
        setShowOTPModal(true);
    };

    return (
        <div className="vehicle-tracking-container">
            {apiProps && <ApiComponent {...apiProps} />}

            {/* Header */}
            <div className="tracking-header">
                <h2>🚗 Live Vehicle Tracking</h2>
                <div className="tracking-controls">
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        className="date-picker"
                    />
                    <label className="auto-refresh-label">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        Auto-refresh (10s)
                    </label>
                    <button onClick={fetchVehicleLocations} className="refresh-btn">
                        🔄 Refresh
                    </button>
                </div>
            </div>

            <div className="tracking-content">
                {/* Vehicle List Sidebar */}
                <div className="vehicle-list-sidebar">
                    <h3>Active Vehicles ({vehicles.length})</h3>
                    {vehicles.length === 0 ? (
                        <p className="no-vehicles">No active vehicles</p>
                    ) : (
                        vehicles.map(vehicle => (
                            <div
                                key={vehicle.vehicle_id}
                                className={`vehicle-item ${selectedVehicle?.vehicle_id === vehicle.vehicle_id ? 'selected' : ''}`}
                                onClick={() => handleVehicleSelect(vehicle)}
                            >
                                <div className="vehicle-number">{vehicle.vehicle_number}</div>
                                <div className="vehicle-status-row">
                                    <span className={`status-badge ${vehicle.status}`}>
                                        {vehicle.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                                <div className="vehicle-info">
                                    <span>Speed: {vehicle.speed || 0} km/h</span>
                                    <span>{vehicle.trip_type}</span>
                                </div>
                                <div className="vehicle-cluster">
                                    {vehicle.cluster_id}
                                </div>
                                {vehicle.current_employee_name && (
                                    <div className="current-employee">
                                        → {vehicle.current_employee_name}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Map */}
                <div className="map-container">
                    <MapContainer
                        center={[12.9716, 77.5946]}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />

                        {/* Vehicle Markers */}
                        {vehicles.map(vehicle => (
                            <Marker
                                key={vehicle.vehicle_id}
                                position={[vehicle.latitude, vehicle.longitude]}
                                icon={vehicleIcon}
                                eventHandlers={{
                                    click: () => handleVehicleSelect(vehicle)
                                }}
                            >
                                <Popup>
                                    <div className="vehicle-popup">
                                        <strong>{vehicle.vehicle_number}</strong>
                                        <p>Owner: {vehicle.vehicle_owner}</p>
                                        <p>Status: <span className={`status-badge ${vehicle.status}`}>
                                            {vehicle.status}
                                        </span></p>
                                        <p>Speed: {vehicle.speed || 0} km/h</p>
                                        <p>Last Updated: {new Date(vehicle.last_updated).toLocaleTimeString()}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Route and Employee Markers */}
                        {routeDetails && routeDetails.employees && (
                            <>
                                {routeDetails.employees.map(emp => {
                                    const isCompleted = emp.trip_status === 'Picked Up' || emp.trip_status === 'Completed';
                                    return (
                                        <Marker
                                            key={emp.employee_id}
                                            position={[emp.latitude, emp.longitude]}
                                            icon={isCompleted ? completedEmployeeIcon : employeeIcon}
                                        >
                                            <Popup>
                                                <div className="employee-popup">
                                                    <strong>{emp.employee_name}</strong>
                                                    <p>Sequence: {emp.sequence}</p>
                                                    <p>Status: {emp.trip_status}</p>
                                                    <p>{emp.employee_address}</p>
                                                    {emp.is_current && emp.trip_status === 'Routing Done' && (
                                                        <button
                                                            onClick={() => openOTPModal(emp)}
                                                            className="otp-btn"
                                                        >
                                                            Enter OTP
                                                        </button>
                                                    )}
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}

                                {/* Route Polyline */}
                                <Polyline
                                    positions={routeDetails.employees.map(e => [e.latitude, e.longitude])}
                                    color="#2196F3"
                                    weight={3}
                                    opacity={0.6}
                                />
                            </>
                        )}
                    </MapContainer>
                </div>

                {/* Route Details Panel */}
                {selectedVehicle && routeDetails && (
                    <div className="route-details-panel">
                        <h3>Route Details</h3>
                        <div className="route-info">
                            <p><strong>Vehicle:</strong> {selectedVehicle.vehicle_number}</p>
                            <p><strong>Cluster:</strong> {selectedVehicle.cluster_id}</p>
                            <p><strong>Type:</strong> {selectedVehicle.trip_type}</p>
                            <p><strong>Status:</strong> <span className={`status-badge ${selectedVehicle.status}`}>
                                {selectedVehicle.status}
                            </span></p>
                            <p><strong>Progress:</strong> {selectedVehicle.current_employee_index + 1} / {routeDetails.employees.length}</p>
                        </div>

                        <h4>Employees</h4>
                        <div className="employee-list">
                            {routeDetails.employees.map((emp, idx) => (
                                <div
                                    key={emp.employee_id}
                                    className={`employee-row ${emp.is_current ? 'current' : ''} ${emp.trip_status === 'Picked Up' || emp.trip_status === 'Completed' ? 'completed' : ''}`}
                                >
                                    <span className="sequence">{emp.sequence}</span>
                                    <span className="name">{emp.employee_name}</span>
                                    <span className={`status-badge ${emp.trip_status}`}>
                                        {emp.trip_status}
                                    </span>
                                    {emp.is_current && emp.trip_status === 'Routing Done' && (
                                        <button
                                            onClick={() => openOTPModal(emp)}
                                            className="small-otp-btn"
                                        >
                                            OTP
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* OTP Modal */}
            {showOTPModal && (
                <Model onClose={() => setShowOTPModal(false)}>
                    <div className="otp-modal">
                        <h3>Enter OTP to Confirm Pickup</h3>
                        <input
                            type="text"
                            maxLength="4"
                            value={otpData.otp}
                            onChange={(e) => setOtpData({ ...otpData, otp: e.target.value.replace(/\D/g, '') })}
                            placeholder="Enter 4-digit OTP"
                            className="otp-input"
                        />
                        <div className="modal-actions">
                            <button onClick={handleOTPSubmit} className="submit-btn">Verify</button>
                            <button onClick={() => setShowOTPModal(false)} className="cancel-btn">Cancel</button>
                        </div>
                    </div>
                </Model>
            )}
        </div>
    );
};

export default VehicleTracking;
