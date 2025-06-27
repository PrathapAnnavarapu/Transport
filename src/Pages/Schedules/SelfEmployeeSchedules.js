import React, { useState, useEffect, useCallback } from 'react';
import Popup from '../../Components/Model';
import Button from '../../Components/Button';
import Toast from '../../Components/Toast';
import WeekRangePicker from '../../Components/WeekRangePicker';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import 'react-datepicker/dist/react-datepicker.css';
import ApiComponent from '../../Components/API';
import { MdEdit, MdOutlineDeleteOutline } from 'react-icons/md';

const EmployeeSchedules = () => {
  const navigate = useNavigate()
  const { warn, info, error, success } = Toast();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [apiProps, setApiProps] = useState(null);
  const [spocschedules, setSpocschedules] = useState([]);
  const [pickupTimings, setPickupTimings] = useState([]);
  const [dropTimings, setDropTimings] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [weekDays, setWeekDays] = useState([]);
  const [editingPickup, setEditingPickup] = useState(null);
  const [editingDrop, setEditingDrop] = useState(null);
  const [userDetails, setUserDetails] = useState({});

  


  useEffect(() => {
    const token = Cookies.get('jwt_token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserDetails(decodedToken.sub);
    }
  }, []);

  useEffect(() => {
    if (userDetails.employee_id) {
      if (spocschedules.length === 0) {
        setApiProps({
          method: 'GET',
          url: `api/get/employee-schedules/self/${userDetails.employee_id}`,
          render: (response) => {
            if (response.data) {
              setSpocschedules(response.data);
            }
          }
        });
      }
      if (pickupTimings.length === 0) {
        setApiProps({
          method: 'GET',
          url: 'api/employees/available/pickup-schedules/all',
          render: (response) => {
            if (response.data) {
              setPickupTimings(response.data);
            }
          }
        });
      }
      if (dropTimings.length === 0) {
        setApiProps({
          method: 'GET',
          url: 'api/employees/available/drop-schedules/all',
          render: (response) => {
            if (response.data) {
              setDropTimings(response.data);
            }
          }
        });
      }
    }
  }, [userDetails, spocschedules, pickupTimings, dropTimings]);



  const handleWeekSelect = (weekRange) => {
    setSelectedWeek(weekRange);
    const [start, end] = weekRange.split(' - ');
    const startDate = new Date(start.split('-').reverse().join('-')); // Convert dd-mm-yyyy to yyyy-mm-dd
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      days.push(day.toLocaleDateString('en-GB')); // Use en-GB for dd/mm/yyyy format
    }
    setWeekDays(days);
  };

  const handleEditPickup = (employeeId, day) => {
    const eligiblePickupTimings = getEligiblePickupTimings(day);
    if (eligiblePickupTimings.length === 0) {
      warn('No eligible pickup timings available.');
      return;
    }
    setEditingPickup({ employeeId, day, eligiblePickupTimings, selectedPickupIdx: 0 });
  };

  const handleEditDrop = (employeeId, day) => {
    const eligibleDropTimings = getEligibleDropTimings(day);
    if (eligibleDropTimings.length === 0) {
      warn('No eligible drop timings available.');
      return;
    }
    setEditingDrop({ employeeId, day, eligibleDropTimings, selectedDropIdx: 0 });
  };

  const handleDeletePickupApiResponse = (response) => {
    if (response.status === 200 || response.status === 201) {
      info(response.data.message);
      setEditingPickup(editingPickup)
      setApiProps({
        method: 'GET',
        url: `api/get/employee-schedules/self/${userDetails.employee_id}`,
        render: (response) => {
          if (response.data) {
            setSpocschedules(response.data);
          }
        }
      });
    } else if (response.status === 409) {
      error(response.data.message);
    } else {
      console.error('An unexpected error occurred');
    }
  }

  const handlePickupDelete = useCallback((employeeId, day) => {
    const dateParts = day.split('/');
    const dayVal = parseInt(dateParts[0], 10);
    const monthVal = parseInt(dateParts[1], 10) - 1; // Months are 0-indexed
    const yearVal = parseInt(dateParts[2], 10);

    const currentDateTime = new Date();

    const hasFuturePickup = pickupTimings.some(timing => {
      const [hours, minutes, seconds = '00'] = timing.pickup_time.split(':');
      const pickupDateTime = new Date(
        yearVal,
        monthVal,
        dayVal,
        parseInt(hours, 10),
        parseInt(minutes, 10),
        parseInt(seconds, 10)
      );

      return pickupDateTime - currentDateTime >= 6 * 60 * 60 * 1000;
    });

    if (!hasFuturePickup) {
      warn('No selected pickup timings available for deletion.');
      return;
    }
    const formattedDate = `${yearVal}-${String(monthVal + 1).padStart(2, '0')}-${String(dayVal).padStart(2, '0')}`;

    setApiProps({
      method: 'DELETE',
      url: `api/employee/pickup-schedule/delete/${employeeId}/${formattedDate}`,
      render: handleDeletePickupApiResponse,
    });

  }, [pickupTimings]);


  const handleDeleteDropApiResponse = (response) => {
    if (response.status === 200 || response.status === 201) {
      info(response.data.message);
      setEditingDrop(editingDrop)
      setApiProps({
        method: 'GET',
        url: `api/get/employee-schedules/self/${userDetails.employee_id}`,
        render: (response) => {
          if (response.data) {
            setSpocschedules(response.data);
          }
        }
      });
    } else if (response.status === 409) {
      error(response.data.message);
    } else {
      console.error('An unexpected error occurred');
    }
  }


  const handleDropDelete = useCallback((employeeId, day) => {
    const dateParts = day.split('/');
    const dayVal = parseInt(dateParts[0], 10);
    const monthVal = parseInt(dateParts[1], 10) - 1; // JS months are 0-based
    const yearVal = parseInt(dateParts[2], 10);

    const currentDateTime = new Date();

    const hasFutureDrop = dropTimings.some(timing => {
      const [hours, minutes, seconds = '00'] = timing.drop_time.split(':');
      const dropDateTime = new Date(yearVal, monthVal, dayVal, parseInt(hours), parseInt(minutes), parseInt(seconds));

      return dropDateTime - currentDateTime >= 4 * 60 * 60 * 1000;;
    });

    if (!hasFutureDrop) {
      warn('No selected drop timings available for deletion.');
      return;
    }

    const formattedDate = `${yearVal}-${String(monthVal + 1).padStart(2, '0')}-${String(dayVal).padStart(2, '0')}`;

    setApiProps({
      method: 'DELETE',
      url: `api/employee/drop-schedule/delete/${employeeId}/${formattedDate}`,
      render: handleDeleteDropApiResponse,
    });

  }, [dropTimings]);

  const handlePickupApiResponse = (response) => {
    if (response.status === 200 || response.status === 201) {
      success(response.data.message);
      setEditingPickup(editingPickup)
      setApiProps({
        method: 'GET',
        url: `api/get/employee-schedules/self/${userDetails.employee_id}`,
        render: (response) => {
          if (response.data) {
            setSpocschedules(response.data);
          }
        }
      });
    } else if (response.status === 409) {
      error(response.data.message);
    } else {
      console.error('An unexpected error occurred');
    }
  };

  const handlePickupChange = useCallback((event, employeeId, day) => {
    const newDate = new Date(day.split('/').reverse().join('-'));
    const currentDateTime = new Date();

    const eligiblePickupTimings = pickupTimings.filter(timing => {
      const pickupDateTime = new Date(`${newDate.toISOString().split('T')[0]}T${timing.pickup_time}`);
      return pickupDateTime - currentDateTime >= 6 * 60 * 60 * 1000;
    });

    const pickup = eligiblePickupTimings[event.target.value]?.pickup_time;

    if (!pickup) return;

    const pickupDateTime = new Date(`${newDate.toISOString().split('T')[0]}T${pickup}`);

    if (pickupDateTime - currentDateTime < 6 * 60 * 60 * 1000) {
      warn('Pickup requests must be made at least 6 hours in advance.');
      setEditingPickup(editingPickup);
      return;
    }


    setApiProps({
      method: 'POST',
      url: 'api/create/employee/pickup-schedules',
      postData: {
        employee_id: employeeId,
        shift_date: newDate.toISOString().split('T')[0],
        pickup_time: pickup,
        drop_time: null,
        trip_status: 'Conform',
      },
      render: handlePickupApiResponse,
    });
  }, [pickupTimings]);

  const handleDropApiResponse = (response) => {
    if (response.status === 200 || response.status === 201) {
      success(response.data.message);
      setEditingDrop(editingDrop)
      setApiProps({
        method: 'GET',
        url: `api/get/employee-schedules/self/${userDetails.employee_id}`,
        render: (response) => {
          if (response.data) {
            setSpocschedules(response.data);
          }
        }
      });
    } else if (response.status === 409) {
      error(response.data.message);
    } else {
      console.error('An unexpected error occurred');
    }
  };

  const handleDropChange = useCallback((event, employeeId, day) => {

    const newDate = new Date(day.split('/').reverse().join('-'));
    const currentDateTime = new Date();

    // Filter eligible drop timings
    const eligibleDropTimings = dropTimings.filter(timing => {
      const dropDateTime = new Date(`${newDate.toISOString().split('T')[0]}T${timing.drop_time}`);
      return dropDateTime - currentDateTime >= 4 * 60 * 60 * 1000;
    });

    const drop = eligibleDropTimings[event.target.value]?.drop_time;

    if (!drop) return;

    const dropDateTime = new Date(`${newDate.toISOString().split('T')[0]}T${drop}`);

    if (dropDateTime - currentDateTime < 4 * 60 * 60 * 1000) {
      warn('Drop requests must be made at least 4 hours in advance.');
      return;
    }

    setApiProps({
      method: 'POST',
      url: 'api/create/employee/drop-schedules',
      postData: {
        employee_id: employeeId,
        shift_date: newDate.toISOString().split('T')[0],
        pickup_time: null,
        drop_time: drop,
        trip_status: 'Conform',
      },
      render: handleDropApiResponse,
    });
  }, [dropTimings]);

  const getEligiblePickupTimings = (day) => {
    const currentDateTime = new Date();
    return pickupTimings.filter(timing => {
      const pickupDateTime = new Date(`${day.split('/').reverse().join('-')}T${timing.pickup_time}`);
      return pickupDateTime - currentDateTime >= 6 * 60 * 60 * 1000;
    });
  };

  const getEligibleDropTimings = (day) => {
    const currentDateTime = new Date();
    return dropTimings.filter(timing => {
      const dropDateTime = new Date(`${day.split('/').reverse().join('-')}T${timing.drop_time}`);
      return dropDateTime - currentDateTime >= 4 * 60 * 60 * 1000;
    });
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to midnight

    const givenDate = new Date(date.split('/').reverse().join('-'));
    givenDate.setHours(0, 0, 0, 0); // Set the time to midnight   

    return givenDate < today;
  };

  const isWithinAdvancePeriod = (date) => {
    const today = new Date();
    const givenDate = new Date(date.split('/').reverse().join('-'));
    const advancePeriod = 15 * 24 * 60 * 60 * 1000; // 15 days in milliseconds
    return givenDate - today <= advancePeriod;
  };

  const isPickupTimeWithinPolicy = (pickupTime, weekDay) => {
    if (!pickupTime || pickupTime === ' -- : --') return true; // Allow if no pickup time

    const currentDateTime = new Date();
    const dateParts = weekDay.split('/');
    const pickupDateTime = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${pickupTime}`);

    // Check if the pickup time is at least 6 hours from now
    const sixHoursInMillis = 6 * 60 * 60 * 1000;
    return (pickupDateTime - currentDateTime) >= sixHoursInMillis;
  };

  const isDropTimeWithinPolicy = (dropTime, weekDay) => {
    if (!dropTime || dropTime === ' -- : --') return true; // Allow if no pickup time

    const currentDateTime = new Date();
    const dateParts = weekDay.split('/');
    const dropDateTime = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${dropTime}`);

    // Check if the pickup time is at least 6 hours from now
    const fourHoursInMillis = 4 * 60 * 60 * 1000;
    return (dropDateTime - currentDateTime) >= fourHoursInMillis;
  }

  return (
    <form className='Spoc-main-menu'>
      {apiProps && <ApiComponent {...apiProps} />}
      <div className='action-buttons-container'>
        <WeekRangePicker numberOfWeeks={7} onWeekSelect={handleWeekSelect} />
        {/* <input type="text" placeholder="Search..." className='search-input' /> */}
        {/* <div>
          <Button type='button' className='primary-button' text='Upload' />
        </div> */}
      </div>
      <div className='spoc-schedules-list'>
        <ul>
          {spocschedules.map((each) => (
            <li key={each.employee_id}>
              <h4>
                <span className='employee-name' onClick={()=> navigate(`/Employee/Details/${each.employee_id}`)}>{each.employee_name}</span> - <span className='employee-id'>{each.employee_id}</span>
              </h4>
              <div className='employee-week-schedule'>
                {weekDays.map((weekDay, index) => {
                  let pickup = ' -- : --';
                  let drop = ' -- : --';

                  // Ensure correct date format
                  const dateParts = weekDay.split('/');
                  const date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
                  const formattedDate = date.toISOString().split('T')[0];

                  each.schedules.forEach((schedule) => {
                    if (schedule.shift_date === formattedDate) {
                      pickup = schedule.pickup_time ? schedule.pickup_time : ' -- : --';
                      drop = schedule.drop_time ? schedule.drop_time : ' -- : --';
                    }
                  });

                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                  return (
                    <div key={index} className='day-schedule'>
                      <strong>{dayName} ({weekDay})</strong>
                      <div>
                        <label>Pickup:</label>
                        {editingPickup && editingPickup.employeeId === each.employee_id && editingPickup.day === weekDay ? (
                          <select
                            onChange={(event) => handlePickupChange(event, each.employee_id, weekDay)}
                          >
                            <option>Select</option>
                            {editingPickup.eligiblePickupTimings.map((timing, idx) => (
                              <option key={idx} value={idx}>{timing.pickup_time}</option>
                            ))}
                          </select>
                        ) : (
                          <input type="text" value={pickup} readOnly className='time-class' />
                        )}
                        {!isPastDate(weekDay) && isWithinAdvancePeriod(weekDay) && isPickupTimeWithinPolicy(pickup, weekDay) && (
                          <>
                            <MdEdit className='edit-icon' onClick={() => handleEditPickup(each.employee_id, weekDay)} />
                            <MdOutlineDeleteOutline className='delete-icon' onClick={() => handlePickupDelete(each.employee_id, weekDay)} />
                          </>
                        )}
                      </div>
                      <div>
                        <label>Drop:</label>
                        {editingDrop && editingDrop.employeeId === each.employee_id && editingDrop.day === weekDay ? (
                          <select onChange={(event) => handleDropChange(event, each.employee_id, weekDay)}
                          >
                            <option>Select</option>
                            {editingDrop.eligibleDropTimings.map((timing, idx) => (
                              <option key={idx} value={idx}>{timing.drop_time}</option>
                            ))}
                          </select>
                        ) : (
                          <input type="text" value={drop} readOnly className='time-class' />
                        )}
                        {!isPastDate(weekDay) && isWithinAdvancePeriod(weekDay) && isDropTimeWithinPolicy(drop, weekDay) && (
                          <>
                            <MdEdit className='edit-icon' onClick={() => handleEditDrop(each.employee_id, weekDay)} />
                            <MdOutlineDeleteOutline className='delete-icon' onClick={() => handleDropDelete(each.employee_id, weekDay)} />
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
        <h4>Select a file format for all invoices</h4>
        <div className='status-buttons'>
          <Button type='button' className='primary-button' text='Ok' />
          <Button type='button' className='primary-button' text='Cancel' onClick={() => setIsPopupOpen(false)} />
        </div>
      </Popup>
    </form>
  );
};

export default EmployeeSchedules;
