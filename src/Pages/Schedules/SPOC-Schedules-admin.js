import React, { useState, useEffect, useCallback, useRef } from 'react';
import Popup from '../../Components/Model';
import Button from '../../Components/Button';
import Toast from '../../Components/Toast';
import WeekRangePicker from '../../Components/WeekRangePicker';
import InfiniteScroll from 'react-infinite-scroll-component'
import 'react-datepicker/dist/react-datepicker.css';
import ApiComponent from '../../Components/API';
import ScheduleTemplateDownloader from './ScheduleTemplateDownload';
import { MdEdit, MdOutlineDeleteOutline } from 'react-icons/md';
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode';
import Loader from '../../Components/Loader';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const SPOCSchedules = () => {
  const navigate = useNavigate()
  const { warn, info, error, success } = Toast();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [apiProps, setApiProps] = useState(null);
  const [spocschedules, setSpocschedules] = useState([]);
  const [pickupTimings, setPickupTimings] = useState([]);
  const [dropTimings, setDropTimings] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [filter, setFilter] = useState('');
  const [userDetails, setUserDetails] = useState({});
  const [weekDays, setWeekDays] = useState([]);
  const [editingPickup, setEditingPickup] = useState(null);
  const [editingDrop, setEditingDrop] = useState(null);
  const [visibleItems, setVisibleItems] = useState([])
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true)
  const [file, setFile] = useState(null)

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
    }
  };


  const handleUpload = async () => {
    if (!file) {
      error('Please select a file');
      return;
    }
    // Check if the file is Excel or CSV
    const validFileTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!validFileTypes.includes(file.type)) {
      error('Please upload a valid Excel (.xls, .xlsx) or CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // Set API Props for file upload using setApiProps
    setApiProps({
      method: 'POST',
      url: 'api/upload/schedules/matrix',  // Endpoint for file upload
      postData: formData,
      render: (response) => {
        setIsPopupOpen(false);
        fetchSchedules();
        success(response.data.message || 'File uploaded successfully');
      },
      catchError: (error) => {
        error(error.response?.data?.error || 'Upload failed');
      },
    });
  };


  const filteredSchedules = spocschedules.filter(item =>
    item.employee_id !== userDetails.employee_id &&
    (item.employee_name || '').toLowerCase().includes(filter.toLowerCase())
  );

  // Determine what to display based on scroll limit
  const displayedItems = filteredSchedules.slice(0, visibleItems.length);


  useEffect(() => {
    const token = Cookies.get('jwt_token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserDetails(decodedToken.sub);
    }
  }, []);


  const fetchLazySchedules = (spocData) => {
    setLoadingMore(true); // Start loader

    const visibleCount = visibleItems.length;
    const nextItems = spocData.slice(visibleCount, visibleCount + 10);

    if (nextItems.length > 0) {
      setVisibleItems(prev => [...prev, ...nextItems]);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false); // Stop loader
  };


  const fetchSchedules = () => {
    // return new Promise((resolve, reject) => {
      setApiProps({
        method: 'GET',
        url: 'api/get/employee-schedules/all',
        render: (response) => {
          if (response.data) {
            setSpocschedules(response.data);
            setVisibleItems([]);
            setHasMore(true);
            fetchLazySchedules(response.data);
            // resolve(response.data);
          } else {
            error('Failed to load schedules');
          }
        }
      
      });
    // });
  };


  useEffect(() => {
    // Fetch schedules if not already loaded
    if (spocschedules.length === 0) {
      fetchSchedules()
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
  }, [spocschedules, pickupTimings, dropTimings]);



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


  const handleDeletePickupApiResponse = async (response) => {
    if (response.status === 200 || response.status === 201) {
      info(response.data.message);
      setEditingPickup(null); // Clear edit state if appropriate
      await fetchSchedules(); // Re-fetch data cleanly
    } else if (response.status === 409) {
      error(response.data.message);
    } else {
      console.error('An unexpected error occurred');
    }
  };


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

      return pickupDateTime >= currentDateTime;
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



  const handleDeleteDropApiResponse = async (response) => {
    if (response.status === 200 || response.status === 201) {
      info(response.data.message);
      setEditingDrop(null); // or setEditingDrop(editingDrop) if needed, but typically you'd clear it
      await fetchSchedules(); // This safely refetches all updated data
    } else if (response.status === 409) {
      error(response.data.message);
    } else {
      console.error('An unexpected error occurred');
    }
  };


  const handleDropDelete = useCallback((employeeId, day) => {
    const dateParts = day.split('/');
    const dayVal = parseInt(dateParts[0], 10);
    const monthVal = parseInt(dateParts[1], 10) - 1; // JS months are 0-based
    const yearVal = parseInt(dateParts[2], 10);

    const currentDateTime = new Date();

    const hasFutureDrop = dropTimings.some(timing => {
      const [hours, minutes, seconds = '00'] = timing.drop_time.split(':');
      const dropDateTime = new Date(yearVal, monthVal, dayVal, parseInt(hours), parseInt(minutes), parseInt(seconds));

      return dropDateTime >= currentDateTime;
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





  const handlePickupApiResponse = async (response) => {
    if (response.status === 200 || response.status === 201) {
      success(response.data.message);
      setEditingPickup(null); // Clear edit state
      await fetchSchedules(); // Refetch updated data
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
      return pickupDateTime >= currentDateTime;
    });

    const pickup = eligiblePickupTimings[event.target.value]?.pickup_time;
    if (!pickup) return;
    const pickupDateTime = new Date(`${newDate.toISOString().split('T')[0]}T${pickup}`);

    if (pickupDateTime <= currentDateTime) {
      warn('Pickup requests must be made less than current time.');
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




  const handleDropApiResponse = async (response) => {
    if (response.status === 200 || response.status === 201) {
      success(response.data.message);
      setEditingDrop(null); // Clear editing state
      await fetchSchedules(); // Safely refetch updated schedules
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
      return dropDateTime >= currentDateTime;
    });
    const drop = eligibleDropTimings[event.target.value]?.drop_time;
    if (!drop) return;
    const dropDateTime = new Date(`${newDate.toISOString().split('T')[0]}T${drop}`);
    if (dropDateTime < currentDateTime) {
      warn('Drop requests must be made less than current time.');
      setEditingDrop(editingDrop)
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
      return pickupDateTime >= currentDateTime;
    });
  };

  const getEligibleDropTimings = (day) => {
    const currentDateTime = new Date();
    return dropTimings.filter(timing => {
      const dropDateTime = new Date(`${day.split('/').reverse().join('-')}T${timing.drop_time}`);
      return dropDateTime >= currentDateTime;
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
    return pickupDateTime >= currentDateTime
  };

  const isDropTimeWithinPolicy = (dropTime, weekDay) => {
    if (!dropTime || dropTime === ' -- : --') return true; // Allow if no pickup time
    const currentDateTime = new Date();
    const dateParts = weekDay.split('/');
    const dropDateTime = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${dropTime}`);
    return dropDateTime >= currentDateTime
  }

  return (
    <form className='Spoc-main-menu'>
      {apiProps && <ApiComponent {...apiProps} />}
      <div className='action-buttons-container'>
        <input type="text" placeholder="Search..." className='search-input' onChange={(e) => setFilter(e.target.value)} />
        <div className='action-buttons-container-with-save'>
          <ScheduleTemplateDownloader setApiProps={setApiProps} />
          <WeekRangePicker numberOfWeeks={7} onWeekSelect={handleWeekSelect} />
          <Button type='button' className='primary-button' text='Upload XL' onClick={() => setIsPopupOpen(true)} />
        </div>
      </div>
      <div className='spoc-infinte-scroll-containers'>
        <InfiniteScroll dataLength={displayedItems.length} pullDownToRefreshThreshold={50} next={() => fetchLazySchedules(spocschedules)} hasMore={hasMore} >
          <div className='spoc-schedules-list'>
            <ul>
              {displayedItems
                .map((each) => (
                  <li key={each.employee_id}>
                    <h4>
                      <span className='employee-name' onClick={() => navigate(`/Employee/Details/${each.employee_id}`)}>{each.employee_name}</span> - <span className='employee-id'>{each.employee_id}</span>
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
            {loadingMore && <Loader />}
          </div>
        </InfiniteScroll>
      </div>
      <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
        <div className='operations-bar'>
          <input type="file" accept=".xls,.xlsx,.csv" onChange={handleFileChange} />
          <Button type="button" text='upload' className='primary-button' onClick={handleUpload} />
          {/* <Button type="button" text='Download' className='primary-button' /> */}
        </div>
      </Popup>
    </form>
  );
};

export default React.memo(SPOCSchedules);
