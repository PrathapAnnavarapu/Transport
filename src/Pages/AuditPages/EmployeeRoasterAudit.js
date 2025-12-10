import React, { useState, useEffect } from "react";
import DatePicker from 'react-datepicker';
import Table from "../../Components/Table";
import Button from "../../Components/Button";
import ApiComponent from '../../Components/API'
import 'react-datepicker/dist/react-datepicker.css';


const EmployeeRosterAudit = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [auditReport, setAuditReport] = useState({});
  const [employeesList, setEmployeesList] = useState([])
  const [selectedEmplyeeID, setSelectedEmplyeeID] = useState('');
  const [apiProps, setApiProps] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);


  useEffect(() => {
    if (!hasFetched) {
      setApiProps({
        method: 'GET',
        url: '/api/employees/all',
        render: (response) => {
          if (response?.data) {
            setEmployeesList(response.data);
            setHasFetched(true); // Mark API as fetched
          }
        }
      });
    }
  }, [hasFetched]);




  const handleFindAuditReport = () => {
    if (!selectedEmplyeeID || !startDate || !endDate) {
      alert("Please select employee and date range.");
      return;
    }

    const formatDate = (date) => {
      if (!date) return null;
      return date.toLocaleDateString("en-CA"); // local YYYY-MM-DD
    };

    const postData = {
      employee_id: selectedEmplyeeID,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
    };

    setApiProps({
      method: "POST",
      url: "api/employee/schedules-with-logs",
      postData,
      render: (response) => {       
        if (response?.data) {
          setAuditReport(response.data);
          setHasFetched(true);
        }
      },
    });
  };

  const headers = [
    { key: "employeeName", label: "Employee Name" },
    { key: "tripType", label: "Trip Type" },
    { key: "requestDate", label: "Request Date" },
    { key: "shiftTime", label: "Shift Time" },
    { key: "routeName", label: "Route Name" },
    { key: "areaName", label: "Area Name" },
    { key: "pickDropTime", label: "Pick/Drop Time" },
    //{ key: "pickupDropLocation", label: "Pickup/Drop Location" },
    { key: "nodalPoints", label: "Nodal Points" },
    { key: "requestDetails", label: "Request Details" },
  ];

  const rowData = (auditReport.schedules || []).map((schedule) => ({
    employeeName: schedule.employee?.employee_name || "",
    tripType: schedule.trip_type,
    requestDate: schedule.shift_date,
    shiftTime: schedule.time,
    routeName: schedule.route_name || "",
    areaName: schedule.employee?.home_area || "",
    pickDropTime: schedule.pickup_time || schedule.drop_time || "",
    pickupDropLocation: schedule.employee?.employee_address || "",
    nodalPoints: schedule.nodal_points || "",
    requestDetails: (
      <div>
        {schedule.logs && schedule.logs.length ? (
          schedule.logs.map((log, index) => (
            <div key={index} className="log-container">
              <div>
                <strong>Notes:</strong> {log.notes || "No notes available"}
              </div>
              <div className="audit-box">
                <div>
                  <strong>Updated ID:</strong> {log.created_by_id}
                </div>
                <div>
                  <strong>Updated By:</strong> {log.created_by_name}
                </div>
                <div>
                  <strong>Updated Time:</strong>{" "}
                  {log.created_at ? new Date(log.created_at).toLocaleString() : "N/A"}
                </div>
                <div>
                  <strong>Action:</strong>{" "}  {log.action}
                </div>
                <div>
                  <strong>Request From:</strong>{" "}
                  <span className="request-from">{log.request_source}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>No logs available</div>
        )}
      </div>
    ),
  }));



  return (
    <div className="roster-container">
      {apiProps && <ApiComponent {...apiProps} />}
      <div className="roaster-action-buttons-container">
        <div className="roaster-date-picker-container">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="Start Date"
            className="date-picker"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            placeholderText="End Date"
            className="date-picker"
          />
          {/* <input type="number" placeholder="Employee ID..." className='search-input' onChange={(e)=>selectedEmplyeeID(e.target.value)} /> */}
          <select
            value={selectedEmplyeeID}
            onChange={(e) => setSelectedEmplyeeID(e.target.value)}
            placeholder="Select Employee ID..."
            className="input-text-field"
            style={{ width: '180px', height: '25px', fontSize: '12px' }}
          >
            <option value="">Select</option>
            {employeesList.map(v => (
              <option key={v.id} value={v.employee_id}>
                {v.employee_name} - {v.employee_id}
              </option>
            ))}
          </select>
          <Button type='button' className='primary-button' text='Find' onClick={handleFindAuditReport} />
        </div>
      </div>

      <Table headers={headers} rowData={rowData} />
    </div>
  );
};

export default EmployeeRosterAudit;
