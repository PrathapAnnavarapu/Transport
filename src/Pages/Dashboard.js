import React, {useState, useEffect, useMemo} from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  CheckCircle,
  Bus,
} from 'lucide-react';
import ToastComponent from '../Components/Toast';
import ApiComponent from '../Components/API'
import Table from '../Components/Table';
import { FaRupeeSign } from 'react-icons/fa';

const Dashboard = () => {
  const { error } = ToastComponent()
  const [todayBillingDetails, setTodayBillingDetails] = useState([])
  const [billingReports, setBillingReports] = useState([])
  const [apiProps, setApiProps] = useState(null);

  const amountSpentToady = todayBillingDetails.reduce((sum, trip) => sum + trip.fare_amount, 0).toLocaleString('en-IN');
   
  const totoalAmountSpent =  billingReports.reduce((sum, trip) => sum + trip.fare_amount, 0).toLocaleString('en-IN');
  
  const thisMonthAmountSpent = billingReports.reduce((sum, trip) => {
    const tripDate = new Date(trip.trip_date);
    if (tripDate.getMonth() === new Date().getMonth()) {
      return sum + trip.fare_amount;
    }
    return sum;
  }, 0).toLocaleString('en-IN');


  const paidBillsTotal = billingReports
  .filter(trip => trip.status === 'paid')
  .reduce((sum, trip) => sum + trip.fare_amount, 0)
  .toLocaleString('en-IN');

  const unpaidBillsTotal = billingReports
  .filter(trip => trip.status === 'unpaid')
  .reduce((sum, trip) => sum + trip.fare_amount, 0)
  .toLocaleString('en-IN');




 useEffect(() => {
    if (todayBillingDetails.length === 0) {
      setApiProps({
        method: 'GET',
        url: 'api/get/todays-billing-report',
        render: (response) => {
          if (response) {
            setTodayBillingDetails(response.data);
          } else {
            error('No response received from API');
          }
        },
        onError: (error) => {
          error('Error fetching vehicles:', error);
        }
      });
    }

    if (billingReports.length === 0){ 
     setApiProps({
        method: 'GET',
        url: 'api/get/billing-report',
        render: (response) => {
          if (response) {
            setBillingReports(response.data);
          } else {
            error('No response received from API');
          }
        },
        onError: (error) => {
          error('Error fetching vehicles:', error);
        }
      });  
    }  
  }, [billingReports, todayBillingDetails])

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
    { key: 'Trip Scheduled Date', label: 'Trip Scheduled Date' },
    { key: 'Vehicle Assigned at', label: 'Vehicle Assigned at'},
    { key: 'Trip Started At', label: 'Trip Started At' },
    { key: 'Trip Ended At', label: 'Trip Ended At' },
  ];

  const exportData = todayBillingDetails.map(item => ({
    'Trip ID': item.trip_id,
    'Trip Type': item.trip_type,
    'Vehicle Number': item.vehicle_number,
    'Vehicle Owner': item.vehicle_owner_name,
    'Trip Scheduled Date': item.trip_date,
    'Fare Amount': `₹${item.fare_amount}`,
    'Payment Status': item.status,
    'Distance Travelled': `${item.distance_travelled} Km`,
    'Route Name': item.route_name,
    'Billing Mode': item.billing_mode,    
    'Vehicle Assigned at': item.vehicle_assigned_at,
    'Employee Names': item.employees.map(e => e.employee_name).join(', '),
    'Shift Date': item.shift_dates.join(', '),
    'Pickup/Drop Shift Time': item.pickup_times?.join(', ') || item.drop_times?.join(', '),
    'Trip Started At': item.trip_started_at,
    'Trip Ended At': item.trip_ended_at,
  }));






  return (
    <div className="dashboard-main">
      {apiProps && <ApiComponent {...apiProps} />}

      {/* Financial Overview */}
      <div className="dashboard-section">
        <h3 className="section-title">Overview</h3>
        <div className="stats-grid">
          <StatsCard
            label="Total Amount Spent"
            value={totoalAmountSpent}
            icon={<FaRupeeSign className="icon green" />}
            color="green-bg"
          />
          <StatsCard
            label="Amount Spent This Month"
            value={thisMonthAmountSpent}
            icon={<FaRupeeSign className="icon red" />}
            color="green-bg"
          />
          <StatsCard
            label="Amount Spent Today"
            value={amountSpentToady}
            icon={<FaRupeeSign className="icon blue" />}
            color="blue-bg"
          />
          <StatsCard
            label="Paid Bills"
            value={paidBillsTotal}
            icon={<CheckCircle className="icon green" />}
            color="green-bg"
            footer="+12% from last month"
            trend="up"
          />
          <StatsCard
            label="Unpaid Bills"
            value={unpaidBillsTotal}
            icon={<FileText className="icon red" />}
            color="red-bg"
            footer="+5% overdue"
            trend="down"
          />
          {/* <StatsCard
            label="Active Users Today"
            value="56"
            icon={<Users className="icon purple" />}
            color="purple-bg"
          /> */}
          <StatsCard
            label="Active Users"
            value="872"
            icon={<Users className="icon green" />}
            color="green-bg"
          />
          {/* <StatsCard
            label="Active Vehicles Today"
            value="12"
            icon={<Bus className="icon red" />}
            color="red-bg"
          /> */}
          <StatsCard
            label="Active Vehicles"
            value="38"
            icon={<Bus className="icon blue" />}
            color="blue-bg"
          />
        </div>
      </div>
      <h3 className="section-title">Today's Trips</h3>
      <Table headers={headers} rowData={exportData} />
    </div>

  );
};

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

export default Dashboard;












