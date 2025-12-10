import React, { useCallback, useEffect, useState, useRef } from 'react';
import ApiComponent from '../../Components/API';
import DatePicker from 'react-datepicker';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaPlus, FaArrowRight } from 'react-icons/fa';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import TimePicker from 'react-time-picker';
import Dropdown from '../../Components/Dropdown';
import ClusterMapModal from '../../Components/ClusterMapModel';
import ToastComponent from '../../Components/Toast';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-time-picker/dist/TimePicker.css';
import 'leaflet/dist/leaflet.css';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    FileText,
    CheckCircle,
    Bus,
} from 'lucide-react';


const StatsCard = ({ label, value, icon, color, footer, trend }) => (
    <div className="stats-card">
        <div className="card-top">
            <div>
                <p className="card-label">{label}</p>
                <p className="card-value">{value}</p>
            </div>
            <div className={`icon-container ${color}`}>{icon}</div>
        </div>
        {/* {footer && (
      <div className="card-footer">
        {trend === 'up' && <TrendingUp className="trend-icon green" />}
        {trend === 'down' && <TrendingDown className="trend-icon red" />}
        <span className={`trend-value ${trend === 'up' ? 'green' : 'red'}`}>
          {footer.split(' ')[0]}
        </span>
        <span className="trend-text">{footer.split(' ').slice(1).join(' ')}</span>
      </div>
    )} */}
    </div>
);

const DropGroupingSchedules = () => {
    const { info, error, success } = ToastComponent();
    const [manualClusters, setManualClusters] = useState({});
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [apiProps, setApiProps] = useState(null);
    const [editable, setEditable] = useState({});
    const [vechilesList, setVechileList] = useState([]);
    const [mapClusterData, setMapClusterData] = useState(null);
    const [routingStatus, setRoutingStatus] = useState({});
    const prevManualClustersRef = useRef();


    useEffect(() => {
        const prevManualClusters = prevManualClustersRef.current;
        if (prevManualClusters && JSON.stringify(prevManualClusters) !== JSON.stringify(manualClusters)) {
            const groupedByDate = new Map(); // Map<shiftDate, Set<pickupTime>>

            Object.entries(manualClusters).forEach(([dropTime, clusters]) => {
                Object.entries(clusters).forEach(([clusterId, cluster]) => {
                    const employeeList = cluster.employeeList;
                    const shiftDate = employeeList && employeeList[0]?.shift_date;

                    if (shiftDate) {
                        if (!groupedByDate.has(shiftDate)) {
                            groupedByDate.set(shiftDate, new Set());
                        }
                        groupedByDate.get(shiftDate).add(dropTime);
                    }
                });
            });

            // Send one request per shift date with all its pickup times
            groupedByDate.forEach((dropTimesSet, shiftDate) => {
                const dropTimes = Array.from(dropTimesSet);
                fetchRoutingDetails(dropTimes, shiftDate);
            });
        }
        prevManualClustersRef.current = manualClusters;
    }, [manualClusters]);


    const fetchRoutingDetails = (dropTimes, shiftDate) => {
        setApiProps({
            method: 'POST',
            url: 'api/get/drop/routing-details',
            postData: JSON.stringify({
                drop_time: dropTimes,  // Now an array
                shift_date: shiftDate
            }),
            render: (detailsResponse) => {
                if (detailsResponse.status === 200 && Array.isArray(detailsResponse.data.data)) {

                    // Filter for both 'Routing Done', 'Picked Up', and 'Completed' statuses
                    const allRoutingData = detailsResponse.data.data.filter(item =>
                        item.routing && ['Routing Done', 'Picked Up', 'Completed'].includes(item.routing.drop_trip_status)
                    );

                    if (allRoutingData.length > 0) {
                        setManualClusters(prevManualClusters => {
                            const updatedClusters = { ...prevManualClusters };
                            const newRoutingStatus = {};
                            const clustersToRemove = new Set(); // To track clusters to be removed

                            allRoutingData.forEach(item => {
                                const group = item.schedule.drop_time; // drop_time is the group
                                const clusterId = item.cluster_id;
                                const vehicleNumber = item?.vehicle?.vechile_number || null;
                                const vechile_id = item?.vehicle?.vechile_id || null;
                                const vehicleOwnerName = item?.vehicle?.vechile_owner_name || null;
                                const employeeList = item.employeeList || []; // Assuming the employee list is in the API response
                                const status = item.routing.drop_trip_status; // Either 'Routing Done', 'Picked Up', or 'Completed'

                                // Check if the cluster and group already exist in the state
                                if (updatedClusters[group] && updatedClusters[group][clusterId]) {
                                    const currentCluster = updatedClusters[group][clusterId];

                                    // Add vehicle details if they are not already set
                                    if (
                                        vehicleNumber &&
                                        (!currentCluster.vehicleDetails || currentCluster.vehicleDetails.vechile_number !== vehicleNumber)
                                    ) {
                                        currentCluster.vehicleDetails = {
                                            vechile_number: vehicleNumber,
                                            vechile_owner_name: vehicleOwnerName,
                                            vechile_id: vechile_id
                                        };
                                    }

                                    // Replace the current employees with the new employeeList
                                    if (Array.isArray(employeeList) && employeeList.length > 0) {
                                        currentCluster.employees = employeeList; // Replace employees with employeeList from the API
                                    }

                                    // Set routing status to either 'completed' or 'routing done', or 'Trip in progress' for 'Picked Up'
                                    if (status === 'Completed') {
                                        newRoutingStatus[`${group}__${clusterId}`] = 'completed';
                                    } else if (status === 'Picked Up') {
                                        newRoutingStatus[`${group}__${clusterId}`] = 'Trip in progress'; // Update here
                                    } else {
                                        newRoutingStatus[`${group}__${clusterId}`] = 'routing done';
                                    }

                                    // If the status is 'Completed', we need to mark this cluster for removal
                                    if (status === 'Completed') {
                                        clustersToRemove.add(`${group}__${clusterId}`);
                                    }
                                }
                            });

                            // Remove the clusters that are marked for removal
                            clustersToRemove.forEach(clusterKey => {
                                const [dropTime, clusterId] = clusterKey.split('__');
                                if (updatedClusters[dropTime] && updatedClusters[dropTime][clusterId]) {
                                    delete updatedClusters[dropTime][clusterId];

                                    // If the pickup group has no clusters left, delete the entire pickup group
                                    if (Object.keys(updatedClusters[dropTime]).length === 0) {
                                        delete updatedClusters[dropTime];
                                    }
                                }
                            });

                            // Filter out any pickup groups that are empty (i.e., they don't have any clusters after removal)
                            Object.keys(updatedClusters).forEach(group => {
                                if (Object.keys(updatedClusters[group]).length === 0) {
                                    delete updatedClusters[group]; // Remove the empty pickup group
                                }
                            });

                            // Update routing status
                            setRoutingStatus(prev => ({
                                ...prev,
                                ...newRoutingStatus
                            }));

                            // Return the updated clusters after filtering out empty groups
                            return updatedClusters;
                        });
                    } else {
                        // Handle case where no routing data is available
                        // info('No routing data found for the selected date.');
                    }
                } else {
                    error("Failed to fetch routing details.");
                }
            }
        });
    };


    // Fetch schedules on date change
    useEffect(() => {
        if (selectedDate) {
            fetchSchedules(selectedDate, () => {
                fetchVehicleList();
            });
        }
    }, [selectedDate]);

    const fetchSchedules = (date, onComplete) => {
    const formattedDate = date.toISOString().split('T')[0];

    setApiProps({
        method: 'POST',
        url: 'api/get/drop/clustered-routes',
        postData: { date: formattedDate },
        render: (response) => {
            const optimizedRoutes = response.data.optimized_routes || [];
            const initialClusters = {};
            const dropTimesToFetch = new Set(); // To collect drop times to check status

            optimizedRoutes.forEach(route => {
                const dropTime = route.drop_time_group;
                const clusters = {};
                route.clusters.forEach((cl, idx) => {
                    const clusterId = `cluster${idx + 1}`;
                    clusters[clusterId] = {
                        employeeList: cl.drop_sequence,
                        routeName: cl.route_name,
                        vehicleDetails: null
                    };
                    dropTimesToFetch.add(dropTime);
                });
                initialClusters[dropTime] = clusters;
            });

            setManualClusters(initialClusters);
            setRoutingStatus({});

            // 🔁 Immediately fetch routing details to filter out completed ones
            const dropTimes = Array.from(dropTimesToFetch);
            if (dropTimes.length > 0) {
                fetchRoutingDetails(dropTimes, formattedDate);
            }

            if (onComplete) onComplete(); // Proceed to next step
        }
    });
};

    // Fetch vehicle list
    const fetchVehicleList = () => {
        if (vechilesList.length === 0) {
            setApiProps({
                method: 'GET',
                url: 'api/get/vechile/all',
                render: (response) => {
                    if (response) {
                        setVechileList(response.data);
                    } else {
                        console.error('No response received from API');
                    }
                },
                onError: (error) => {
                    console.error('Error fetching vehicles:', error);
                }
            });
        }
    };

    // Save cluster changes
    const saveClusterChanges = (dropTime, clusterId, empIndex) => {
        const cluster = manualClusters[dropTime][clusterId];

        if (!cluster) {
            console.error("Cluster not found.");
            return;
        }

        const shiftDate = cluster.employeeList[0]?.shift_date;
        const employee = cluster.employeeList[empIndex];
        if (!employee) {
            console.error('Employee not found at the given index');
            return;
        }

        // Update the relevant employee's details
        cluster.employeeList[empIndex] = {
            ...employee,
            drop_sequence: employee.drop_sequence,  // (if modified)
            calculated_drop_time: employee.calculated_drop_time,  // (if modified)
            distance_from_last: employee.distance_from_last || 0,  // Handle undefined
            cumulative_distance: employee.cumulative_distance || 0,  // Handle undefined
        };


        const payload = {
            clusters: manualClusters,
            date: shiftDate,
        };

        setApiProps({
            method: 'PUT',
            url: `api/get/drop/updated/manual-clustered-details/${employee.employee_id}/${employee.schedule_id}`,
            postData: JSON.stringify(payload),  // Ensure the payload is stringified
            render: (response) => {
                if (response.status === 200) {
                    success("Changes saved successfully.");
                    fetchRoutingDetails([dropTime], shiftDate);
                } else {
                    error(response?.message || "Failed to save changes.");
                }
            }
        });
    };



    // Add a new cluster to the drop time
    const addNewCluster = (dropTime) => {
        setManualClusters((prev) => {
            const current = prev[dropTime] || {};
            const newClusterId = `cluster${Object.keys(current).length + 1}`;
            return {
                ...prev,
                [dropTime]: {
                    ...current,
                    [newClusterId]: {
                        employeeList: [],
                        vehicleDetails: null
                    }
                }
            };
        });
    };


    // Handle "Optimize Routing" button click
    const handleProceed = useCallback((dropTime, clusterId) => {
        const cluster = manualClusters[dropTime][clusterId];
        if (!cluster.vehicleDetails) {
            ToastComponent().error("Please select a vehicle");
            return;
        }

        const postCluster = {
            [dropTime]: [{
                ...cluster,
                clusterId: clusterId
            }]
        };

        setApiProps({
            method: 'POST',
            url: 'api/get/drop-routing',
            postData: JSON.stringify(postCluster),
            render: (response) => {
                const result = response.data;

                if (!result || !result.route || !Array.isArray(result.route)) {
                    console.error("Invalid response format: 'route' array not found", result);
                    error("Failed to update routing. Invalid response format.");
                    return;
                }

                const updated = { ...manualClusters };
                const newRoute = result.route.find(r => r.drop_time_group === dropTime);

                if (newRoute) {
                    newRoute.clusters.forEach((cl, idx) => {
                        const clusterKey = Object.keys(updated[dropTime])[idx] || `cluster${idx + 1}`;
                        updated[dropTime][clusterKey].employeeList = cl.drop_sequence;

                        const tripStatus = cl.trip_status;
                        if (tripStatus) {
                            setRoutingStatus(prev => ({
                                ...prev,
                                [`${dropTime}__${clusterKey}`]: tripStatus
                            }));
                        }

                        // saveClusterChanges(dropTime, clusterKey);
                    });
                }

                setManualClusters(updated);

                // ✅ Get shift_date from first employee in the cluster
                const shiftDate = cluster.employeeList[0]?.shift_date;
                if (shiftDate) {
                    fetchRoutingDetails([dropTime], shiftDate);  // Send as list
                } else {
                    console.warn("Shift date not found in cluster data");
                }
            }
        });
    }, [manualClusters, success, error, info]);



    // Handle drag-and-drop behavior
    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

        const [sourceTime, sourceCluster] = source.droppableId.split('__');
        const [destTime, destCluster] = destination.droppableId.split('__');
        if (sourceTime !== destTime) return;

        const sourceItems = Array.from(manualClusters[sourceTime][sourceCluster].employeeList);
        const destItems = Array.from(manualClusters[destTime][destCluster].employeeList);
        const [movedItem] = sourceItems.splice(source.index, 1);

        // Prevent moving an employee if they already exist in the destination
        if (destItems.some(emp => emp.employee_id === movedItem.employee_id)) return;

        // Move the item to the destination
        destItems.splice(destination.index, 0, movedItem);


        // Update the clusters with the new data
        const updatedClusters = {
            ...manualClusters,
            [sourceTime]: {
                ...manualClusters[sourceTime],
                [sourceCluster]: {
                    ...manualClusters[sourceTime][sourceCluster],
                    employeeList: sourceItems
                },
                [destCluster]: {
                    ...manualClusters[destTime][destCluster],
                    employeeList: destItems
                }
            }
        };

        // Remove any empty clusters before sending the data to the API
        Object.keys(updatedClusters[sourceTime]).forEach(cluster => {
            if (updatedClusters[sourceTime][cluster].employeeList.length === 0) {
                delete updatedClusters[sourceTime][cluster];
            }
        });
        Object.keys(updatedClusters[destTime]).forEach(cluster => {
            if (updatedClusters[destTime][cluster].employeeList.length === 0) {
                delete updatedClusters[destTime][cluster];
            }
        });

        setManualClusters(updatedClusters);

        // Update routing status
        setRoutingStatus(prev => ({
            ...prev,
            [`${sourceTime}__${sourceCluster}`]: false,
            [`${destTime}__${destCluster}`]: false
        }));

        const shiftDate = movedItem?.shift_date || new Date().toISOString().split("T")[0];
        const isoDate = `${shiftDate}T${sourceTime}`;

        const payload = {
            clusters: updatedClusters,
            date: isoDate, // Correct ISO 8601 format
        };

        // Call the API to save the updated clusters
        setApiProps({
            method: 'POST',
            url: 'api/get/drop/updated/manual-clustered-routes',
            postData: JSON.stringify(payload),  // Ensure payload is stringified
            render: (response) => {
                if (response.status === 200) {
                    success("Saved successfully.");
                    fetchSchedules(shiftDate);
                } else {
                    error(response?.message || "Failed to save changes.");
                }
            }
        });
    };


    // Update employee values
    const updateEmployeeValue = (dropTime, clusterId, empIndex, key, value) => {
        setManualClusters(prev => {
            const updated = { ...prev };
            const cluster = [...updated[dropTime][clusterId].employeeList];
            cluster[empIndex][key] = value;
            updated[dropTime][clusterId].employeeList = cluster;
            return updated;
        });
    };

    const toggleEdit = (dropTime, clusterId, empIndex) => {
        const key = `${dropTime}__${clusterId}__${empIndex}`;
        const wasEditing = editable[key];
        setEditable(prev => ({ ...prev, [key]: !prev[key] }));
        if (wasEditing === true) {
            saveClusterChanges(dropTime, clusterId, empIndex);
        }
    };

    const getValidTime = (timeStr) => {
        if (!timeStr || typeof timeStr !== 'string') return '00:00';
        const match = timeStr.match(/^(\d{2}):(\d{2})/);
        return match ? match[0] : '00:00';
    };



    const totalRoutes = Object.keys(manualClusters).reduce((acc, dropTime) => {
        return acc + Object.keys(manualClusters[dropTime]).length;
    }, 0);

    const totalEmployees = Object.values(manualClusters).reduce((acc, clusters) => {
        return acc + Object.values(clusters).reduce((clusterAcc, clusterData) => {
            return clusterAcc + (clusterData?.employeeList?.length || 0);
        }, 0);
    }, 0);



    return (
        <div className="pick-grouping-main-container">
            {apiProps && <ApiComponent {...apiProps} />}
            {mapClusterData && <ClusterMapModal clusterData={mapClusterData} onClose={() => setMapClusterData(null)} />}
            <div className="grouping-schediles-with-datepicker-container">
                <h2>Drop Routing</h2>
                <DatePicker
                    selected={selectedDate}
                    onChange={date => { if (date) setSelectedDate(date); }}
                    className="date-range-picker"
                />
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                {Object.keys(manualClusters).length === 0 ? (
                    <div className="no-schedules-message">
                        <img src='/Images/897245_clock_manage_schedule_time_icon.png' alt='schedule' />
                        <p>No schedules available.</p>
                    </div>
                ) : (
                    <div className="grouped-schedules-list">
                        <div className="stats-grid">
                            <StatsCard
                                label="Total Routes"
                                value={totalRoutes}
                                icon={<Bus className="icon green" />}
                                color="green-bg"
                            />
                            <StatsCard
                                label="Total Employees"
                                value={totalEmployees}
                                icon={<Users className="icon blue" />}
                                color="green-bg"
                            />
                        </div>
                        {Object.entries(manualClusters)
                            .sort(([timeA], [timeB]) => {
                                const tA = timeA.padStart(5, '0');
                                const tB = timeB.padStart(5, '0');
                                return tA.localeCompare(tB);
                            })
                            .map(([dropTime, clusters]) => {
                                const totalRoutes = Object.keys(clusters).length;
                                const totalEmployees = Object.values(clusters).reduce(
                                    (total, clusterData) =>
                                        total +
                                        (clusterData?.employeeList?.length || 0),
                                    0
                                );

                                return (
                                    <div className="pickuptime-group" key={dropTime}>
                                        <div className="pickuptime-with-actions">
                                            <h4>Drop Time: {dropTime}</h4>
                                            <h5>Total Routes: {totalRoutes}</h5>
                                            <h5>Total Employees: {totalEmployees}</h5>
                                            <button onClick={() => addNewCluster(dropTime)} className="add-cluster-btn"><FaPlus /> Add Cluster</button>
                                        </div>
                                        <div className="clusters-container">
                                            {Object.entries(clusters).map(([clusterId, clusterData]) => {
                                                const employeeList = clusterData?.employeeList || [];
                                                const routeName = clusterData?.routeName || '';
                                                const vehicleDetails = clusterData?.vehicleDetails;
                                                const isOptimized = routingStatus[`${dropTime}__${clusterId}`];

                                                return (
                                                    <Droppable droppableId={`${dropTime}__${clusterId}`} key={`${dropTime}__${clusterId}`}>
                                                        {(provided) => (
                                                            <div className="cluster-card" ref={provided.innerRef} {...provided.droppableProps}>
                                                                <div className="cluster-card-with-vechile">
                                                                    <h5>{clusterId}</h5>
                                                                    {isOptimized ? (
                                                                        routingStatus[`${dropTime}__${clusterId}`] === 'Trip in progress' ? (
                                                                            <span className="trip-in-progress">Trip Started</span>
                                                                        ) : (
                                                                            <IoCheckmarkCircleOutline className="optimized-check-icon" size={20} color="green" />
                                                                        )
                                                                    ) : (
                                                                        <button onClick={() => handleProceed(dropTime, clusterId)} className="optimize-routing-btn">
                                                                            <FaArrowRight /> Assign Vehicle
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="cluster-card-with-vechile">
                                                                    <Dropdown
                                                                        options={['', ...vechilesList.map(option => `${option.vechile_number} - ${option.vechile_owner_name}`)]}
                                                                        key={vechilesList.map(option => option.vechile_id).join('-')}
                                                                        className="vechile-dropdown"
                                                                        htmlFor="vechile"
                                                                        id="vechile"
                                                                        label=""
                                                                        value={vehicleDetails ? `${vehicleDetails.vechile_number} - ${vehicleDetails.vechile_owner_name}` : ''}
                                                                        onChange={(e) => {
                                                                            const selectedValue = e.target.value.trim();

                                                                            if (selectedValue === '') {
                                                                                setManualClusters(prev => ({
                                                                                    ...prev,
                                                                                    [dropTime]: {
                                                                                        ...prev[dropTime],
                                                                                        [clusterId]: {
                                                                                            ...prev[dropTime][clusterId],
                                                                                            vehicleDetails: null
                                                                                        }
                                                                                    }
                                                                                }));
                                                                                success("Vehicle assigned");  // Show toast when cleared
                                                                                return;
                                                                            }

                                                                            const selectedVehicle = vechilesList.find(v => `${v.vechile_number} - ${v.vechile_owner_name}` === selectedValue);

                                                                            if (selectedVehicle && (!vehicleDetails || selectedVehicle.vechile_id !== vehicleDetails.vechile_id)) {
                                                                                setManualClusters(prev => ({
                                                                                    ...prev,
                                                                                    [dropTime]: {
                                                                                        ...prev[dropTime],
                                                                                        [clusterId]: {
                                                                                            ...prev[dropTime][clusterId],
                                                                                            vehicleDetails: selectedVehicle
                                                                                        }
                                                                                    }
                                                                                }));

                                                                                const payload = employeeList.map(employee => ({
                                                                                    vehicle_id: selectedVehicle.id,
                                                                                    employee_id: employee.employee_id,
                                                                                    schedule_id: employee.schedule_id
                                                                                }));

                                                                                if (payload.length === 0) {
                                                                                    console.error('No employees in the cluster.');
                                                                                    return;
                                                                                }

                                                                                setApiProps({
                                                                                    method: 'POST',
                                                                                    url: 'api/update/drop-vehicles',
                                                                                    postData: JSON.stringify(payload),
                                                                                    render: (response) => {
                                                                                        if (response.status === 200) {
                                                                                            success("Vehicle updated");  // Show updated toast here
                                                                                            fetchRoutingDetails([dropTime], employeeList[0]?.shift_date);
                                                                                        } else {
                                                                                            error(response?.message || "Failed to update vehicles.");
                                                                                        }
                                                                                    }
                                                                                });
                                                                            }
                                                                        }}

                                                                        onFocus={(e) => {
                                                                            const currentValue = e.target.value;
                                                                            e.target.value = '';
                                                                            setTimeout(() => {
                                                                                e.target.value = currentValue;
                                                                            }, 0);
                                                                        }}
                                                                        placeholder="Vehicle No"
                                                                        name="vechileNo"
                                                                        dropDownList="vechilesList"
                                                                        disabled={!editable[`${dropTime}__${clusterId}`]}
                                                                    />
                                                                    <button onClick={() => setMapClusterData(employeeList)} disabled={employeeList.length === 0} className='view-map-button'>Map</button>
                                                                </div>
                                                                <div className='cluster-route-info'>
                                                                    <h6>Route Name : <span>{routeName}</span></h6>
                                                                </div>
                                                                {employeeList.length === 0 && (
                                                                    <button onClick={() => {
                                                                        const updated = { ...manualClusters };
                                                                        delete updated[dropTime][clusterId];
                                                                        setManualClusters(updated);
                                                                    }} className="remove-cluster-btn">✕</button>
                                                                )}
                                                                {employeeList.map((emp, idx) => {
                                                                    const editKey = `${dropTime}__${clusterId}__${idx}`;
                                                                    return (
                                                                        <Draggable key={emp.employee_id} draggableId={emp.employee_id} index={idx}>
                                                                            {(provided) => (
                                                                                <div className="employee-card" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                                    <p><strong>{emp.employee_name || 'Unnamed'}</strong></p>
                                                                                    <p><img src='/Images/5172573_location_map_icon.png' className='location-icon' />{emp.employee_address || 'No address'}</p>
                                                                                    {emp.calculated_drop_time && (
                                                                                        <>
                                                                                            <p><img src='/Images/3859125_app_hour_interface_time_timer_icon.png' className='clock-icon' />
                                                                                                Drop Time: {editable[editKey] ? (
                                                                                                    <TimePicker
                                                                                                        onChange={(val) => updateEmployeeValue(dropTime, clusterId, idx, 'calculated_drop_time', val + ':00')}
                                                                                                        value={getValidTime(emp.calculated_drop_time)}
                                                                                                        disableClock
                                                                                                        format="HH:mm"
                                                                                                        clearIcon={null}
                                                                                                        locale="en-GB"
                                                                                                    />
                                                                                                ) : <span>{emp.calculated_drop_time || 'N/A'}</span>}
                                                                                            </p>
                                                                                            <p>🚗 Sequence: {editable[editKey] ? (
                                                                                                <input type="number" min="1" value={emp.drop_sequence || ''} onChange={(e) =>
                                                                                                    updateEmployeeValue(dropTime, clusterId, idx, 'drop_sequence', parseInt(e.target.value, 10))} />
                                                                                            ) : <span className='drop-seqence'>{emp.drop_sequence || 'N/A'}</span>}</p>
                                                                                        </>
                                                                                    )}
                                                                                    <button onClick={() => toggleEdit(dropTime, clusterId, idx)}>{editable[editKey] ? 'Save' : 'Edit'}</button>
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    );
                                                                })}
                                                                {provided.placeholder}
                                                            </div>
                                                        )}
                                                    </Droppable>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                )}
            </DragDropContext>
        </div>

    );
};

export default DropGroupingSchedules;
