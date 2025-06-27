import React,{ useEffect, useState, useCallback, useMemo } from 'react'
import ApiComponent from '../../Components/API';
import ToastComponent from '../../Components/Toast';

function ScheduleManager() {
  const { warn, success } = ToastComponent();

  const [pickupSchedules, setPickupSchedules] = useState([]);
  const [dropSchedules, setDropSchedules] = useState([]);
  const [pickupTime, setPickupTime] = useState('');
  const [dropTime, setDropTime] = useState('');
  const [apiProps, setApiProps] = useState(null);

  // Fetch both schedules one after the other using chained setApiProps
  useEffect(() => {
    if (pickupSchedules.length === 0 || dropSchedules.length === 0) {
      fetchPickupSchedules();
    }
  }, []);

  const fetchPickupSchedules = () => {
    setApiProps({
      method: 'GET',
      url: 'api/employees/available/pickup-schedules/all',
      render: (response) => {
        if (response.data) {
          setPickupSchedules(response.data);
          fetchDropSchedules(); // Only after pickup
        }
      },
    });
  };

  const fetchDropSchedules = () => {
    setApiProps({
      method: 'GET',
      url: 'api/employees/available/drop-schedules/all',
      render: (response) => {
        if (response.data) {
          setDropSchedules(response.data);
        }
      },
    });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!pickupTime || !dropTime) return warn("Both times are required");

    // Ensure that both times are in 24-hour format before sending to the backend
    setApiProps({
      method: 'POST',
      url: 'api/employees/available/schedule/add',
      postData: JSON.stringify({
        pickup_time: pickupTime,
        drop_time: dropTime
      }),
      render: (response) => {
        if (response.data) {
          success(response.data?.message);
          setPickupTime('');
          setDropTime('');
          fetchPickupSchedules(); // Re-fetch both
        }
      },
    });
  };

  const handleDelete = (id) => {
    setApiProps({
      method: 'POST',
      url: `api/employees/available/schedule/${id}/delete`,
      render: (response) => {
        if (response.data) {
          success(response.data?.message);
          fetchPickupSchedules(); // Re-fetch both
        }
      },
    });
  };

  // Format 24-hour time from input (e.g., "12:00" -> "12:00", "9:00 AM" -> "09:00")
  const formatTo24Hour = (time) => {
    const [hours, minutes] = time.split(':');
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  };

  // Helper function to format time to 24-hour format (HH:mm)
  const formatTime = (time) => {
    if (!time) return '';
    const [hour, minute] = time.split(':');
    return `${String(hour).padStart(2, '0')}:${minute}`;  // Return as HH:mm
  };

  return (
    <div className="schedule-manager-container">
      {apiProps && <ApiComponent {...apiProps} />}
      
      <div className='title-with-form-container'>
        <h2>Schedule Manager</h2>
        <form className="form" onSubmit={handleAdd}>
          <input
            type="time"
            value={pickupTime}
            onChange={(e) => setPickupTime(formatTo24Hour(e.target.value))}
            required
          />
          <input
            type="time"
            value={dropTime}
            onChange={(e) => setDropTime(formatTo24Hour(e.target.value))}
            required
          />
          <button type="submit">Add</button>
        </form>
      </div>
      <div className="columns">
        <div className="column">
          <h3>Pickup Times</h3>
          <ul className="list">
            {pickupSchedules.map((item) => (
              <li key={item.id} className="list-item">
                {formatTime(item.pickup_time)} {/* Show formatted 24-hour time */}
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="column">
          <h3>Drop Times</h3>
          <ul className="list">
            {dropSchedules.map((item) => (
              <li key={item.id} className="list-item">
                {formatTime(item.drop_time)} {/* Show formatted 24-hour time */}
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ScheduleManager;
