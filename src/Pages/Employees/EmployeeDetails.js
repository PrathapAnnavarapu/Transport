import React, { useState, useEffect, useRef} from 'react';
import { useParams } from "react-router-dom";
import ApiComponent from '../../Components/API';
import Button from '../../Components/Button';
import ToastComponent from '../../Components/Toast';
// import ClusterMapModal from '../../Components/ClusterMapModel'; // NO CHANGE to this component here
import SingleEmployeeMap from './SingleEmployeeMap'; // import new map component
import { MdEdit } from 'react-icons/md';

const EmployeeDetails = () => {
  const { success, error } = ToastComponent();
  const { id: employeeId } = useParams();
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [hideSummary, setHideSummary] = useState(false);
  const [apiProps, setApiProps] = useState(null);
  const [distance, setDistance] = useState(null); // in kilometers
  const didFetchRef = useRef(false);

  

  // This function fetches employee details and sets state
  const fetchEmployeeDetails = () => {
    setApiProps({
      method: 'GET',
      url: `api/get/employee?employeeId=${employeeId}`,
      render: (response) => {
        if (response && response.data) {
          setEmployeeDetails(response.data);
        }
      },
    });
  };

  useEffect(() => {
    if (!didFetchRef.current && employeeId) {
      fetchEmployeeDetails();
      didFetchRef.current = true;
    }
  }, [employeeId]);

  // Callback to be called after successful PUT update from SingleEmployeeMap
  const handleUpdateSuccess = () => {
    fetchEmployeeDetails();
    success('Updated employee location successfully'); 
  };

    return (
        <div className='modules'>
            {apiProps && <ApiComponent {...apiProps} />}

            <div className='operations-bar'>
                <div className='module-title'>
                    <h2>Employee Details</h2>
                    {distance !== null && (
                    <div style={{ marginTop: 10 }}>
                        <strong>Route Distance:</strong> {distance.toFixed(2)} km
                    </div>
                    )}
                </div>                
            </div>
            <div className='invoice-summary-action-buttons'>
                <div className='invoice-summary-details'>
                    <div className='invoice-details'>
                        <div className='invoice-details-table'>
                            {/* Use new map here, no popup, no modal */}
                            <SingleEmployeeMap employee={employeeDetails} onUpdateSuccess={handleUpdateSuccess} setDistance={setDistance}/>
                        </div>
                    </div>
                    <div className='invoice-summary-and-total'>
                        <div className={hideSummary ? 'hide-invoice-summary-and-toggle-buttons' : 'invoice-summary-and-toggle-buttons'}>
                            <div className={hideSummary ? 'hide-invoice-summary' : 'invoice-summary'}>
                                <h6>Employee Summary <span><MdEdit /></span></h6>
                                <ul className={hideSummary ? 'hide-ul-details' : 'ul-details'}>
                                    <li> ID: <p className='special-calss-invoiceNo'>{employeeDetails.employee_id}</p></li>
                                    <li> Name: <span className='vendor-name-spl'>{employeeDetails.employee_name}</span></li>
                                    <li> Role: <span>{employeeDetails.role}</span></li>
                                    <li> Gender: <span>{employeeDetails.gender}</span></li>
                                    <li> Email: <span>{employeeDetails.employee_email}</span></li>
                                    <li> Address: <span>{employeeDetails.employee_address}</span></li>
                                    <li> Mobile No: <span>{employeeDetails.employee_mobile_no}</span></li>
                                    {employeeDetails.area_name && <li>Area Name: <span>{employeeDetails.area_name}</span></li>}
                                    {employeeDetails.process && <li>Process: <span>{employeeDetails.process}</span></li>}
                                    {employeeDetails.poc_name && <li>POC Name: <span>{employeeDetails.poc_name}</span></li>}
                                    {employeeDetails.poc_mobile && <li>POC Mobile No: <span>{employeeDetails.poc_mobile}</span></li>}
                                    <li>Geo Codes: <span>{employeeDetails.latitude},{employeeDetails.longitude}</span></li>
                                </ul>                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(EmployeeDetails);
