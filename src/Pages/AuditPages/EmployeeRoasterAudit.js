import React, { useState } from "react";
import DatePicker from 'react-datepicker';
import Table from "../../Components/Table";
import Button from "../../Components/Button";
import 'react-datepicker/dist/react-datepicker.css';


const EmployeeRosterAudit = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const auditInfo = {
    updatedId: "200000000078824",
    updatedBy: "Prathap Annavarapu",
    updatedTime: "30-05-2025 16:12:55",
    requestFrom: "WebConsole",
  };

  const rosterData = [
    {
      employeeName: "Alice Johnson",
      tripType: "Pickup",
      requestDate: "2025-06-06",
      shiftTime: "9:00 AM",
      routeName: "Route 1",
      areaName: "Sector 12",
      pickDropTime: "8:30 AM",
      pickupDropLocation: "Gate 3",
      nodalPoints: "Point A, Point B",
      requestDetails: "Needs wheelchair assistance",
    },
    {
      employeeName: "Bob Smith",
      tripType: "Drop",
      requestDate: "2025-06-06",
      shiftTime: "6:00 PM",
      routeName: "Route 2",
      areaName: "Downtown",
      pickDropTime: "6:30 PM",
      pickupDropLocation: "Building 5",
      nodalPoints: "Point X, Point Y",
      requestDetails: "Prefers AC cab",
    },
  ];

  const headers = [
    { key: "employeeName", label: "Employee Name" },
    { key: "tripType", label: "Trip Type" },
    { key: "requestDate", label: "Request Date" },
    { key: "shiftTime", label: "Shift Time" },
    { key: "routeName", label: "Route Name" },
    { key: "areaName", label: "Area Name" },
    { key: "pickDropTime", label: "Pick/Drop Time" },
    { key: "pickupDropLocation", label: "Pickup/Drop Location" },
    { key: "nodalPoints", label: "Nodal Points" },
    { key: "requestDetails", label: "Request Details" },
  ];

  const rowData = rosterData.map((employee) => ({
    ...employee,
    requestDetails: (
      <div>
        <div><strong>Details:</strong> {employee.requestDetails}</div>
        <div className="audit-box">
          <div><strong>Updated ID:</strong> {auditInfo.updatedId}</div>
          <div><strong>Updated By:</strong> {auditInfo.updatedBy}</div>
          <div><strong>Updated Time:</strong> {auditInfo.updatedTime}</div>
          <div>
            <strong>Request From:</strong>{" "}
            <span className="request-from">{auditInfo.requestFrom}</span>
          </div>
        </div>
      </div>
    ),
  }));

  return (
    <div className="roster-container">
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
        <input type="number" placeholder="Employee ID..." className='search-input' />
        <Button type='button' className='primary-button' text='Find'/>
      </div>
      </div>

      <Table headers={headers} rowData={rowData} />
    </div>
  );
};

export default EmployeeRosterAudit;
