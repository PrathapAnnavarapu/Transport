import React, { useEffect, useState } from 'react';
import TextInput from '../../Components/TextInput';
import Button from '../../Components/Button';
import ApiComponent from '../../Components/API';
import ToastComponent from '../../Components/Toast';

const AddEmployeeDetails = ({ employee, onSuccess }) => {
    console.log(employee)
    const { error, success } = ToastComponent();
    const [isSubmit, setIsSubmit] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiProps, setApiProps] = useState(null);
    const [officeLocation, setOfficeLocation] = useState('')
    const [LocationList, setLocationList] = useState([])

    const initialEmployeeDetails = {
        employeeName: '',
        employeeEmail: '',
        employeeMobileNo: '',
        gender: '',
        homeArea: '',
        employeeId: '',
        activeStatus: '',
        role: '',
        process: '',
        pocName: '',
        pocMobileNo: '',
        employeeAddress: '',
        coordinates: ''
    };

    const [employeeDetails, setEmployeeDetails] = useState(initialEmployeeDetails);

    useEffect(() => {
        setApiProps({
            method: 'GET',
            url: 'api/locations/all',
            render: (response) => {
                if (response?.data) {
                    setLocationList(response.data);
                }
            },
            catchError: (err) => {
                error(err?.response?.data?.error || 'Failed to fetch locations');
            }
        });
    }, []);

    // ✅ Sync selected employee → form state
    useEffect(() => {
        if (employee) {
            setEmployeeDetails({
                employeeName: employee.employee_name || '',
                employeeEmail: employee.employee_email || '',
                employeeMobileNo: employee.employee_mobile_no || '',
                gender: employee.gender || '',
                homeArea: employee.home_area || '',
                employeeId: employee.employee_id || '',
                activeStatus: employee.active_status || '',
                role: employee.role || '',
                process: employee.process || '',
                pocName: employee.poc_name || '',
                pocMobileNo: employee.poc_mobile_no || '',
                employeeAddress: employee.employee_address || '',
                coordinates: employee.coordinates || ''
            });
        } else {
            setEmployeeDetails(initialEmployeeDetails);
        }
    }, [employee]);

    const requiredFields = [
        'employeeName', 'employeeEmail', 'employeeMobileNo', 'gender',
        'employeeId', 'role', 'process', 'employeeAddress', 'coordinates',
        'homeArea', 'activeStatus'
    ];

    const validateForm = (values) => {
        const errors = {};
        requiredFields.forEach(field => {
            if (!values[field]) {
                errors[field] = `${field} is required!`;
            }
        });
        return errors;
    };

    useEffect(() => {
        if (Object.keys(errors).length === 0 && isSubmit) {
            const method = employee ? 'PUT' : 'POST';
            const url = employee
                ? `api/employees/update/${employee.employee_id}`
                : 'api/add/new/employee';

            setApiProps({
                method,
                url,
                postData: {...employeeDetails, work_location:officeLocation},
                render: (response) => {
                    success(
                        response.data?.msg ||
                        (employee ? 'Employee updated successfully' : 'Employee added successfully')
                    );
                    setEmployeeDetails(initialEmployeeDetails);
                    setApiProps(null);
                    if (onSuccess) onSuccess(); // ✅ notify parent to refresh
                },
                catchError: (err) => {
                    error(err?.response?.data?.error || 'Failed to save employee');
                }
            });
            setIsSubmit(false);
        }
    }, [errors, isSubmit, employee, employeeDetails, onSuccess, success, error]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setEmployeeDetails(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({
            ...prev,
            [name]: value.trim() === '' && requiredFields.includes(name) ? 'This field is required' : ''
        }));
    };

    const submitForm = (e) => {
        e.preventDefault();
        setErrors(validateForm(employeeDetails));
        setIsSubmit(true);
    };

    const formatLabel = (key) =>
        key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

    const topFields = Object.keys(employeeDetails).filter(
        key => key !== 'employeeAddress' && key !== 'coordinates'
    );

    return (
        <div className="create-invoice-fields-container">
            {apiProps && <ApiComponent {...apiProps} />}

            <form className="form-results-container" onSubmit={submitForm}>
                <div className="invoice-summary-input-fields">
                    {topFields.map((key) => (
                        <div key={key}>
                            <TextInput
                                htmlFor={key}
                                label={formatLabel(key)}
                                id={key}
                                type="text"
                                className={errors[key] ? 'error-invoice-text-field' : 'invoice-text-field'}
                                labelClassName="invoice-label-text"
                                placeholder={formatLabel(key)}
                                onChange={handleChange}
                                name={key}
                                value={employeeDetails[key]}
                                mandatory={requiredFields.includes(key) ? '*' : ''}
                            />
                            {errors[key] && <p className="error-msg">{errors[key]}</p>}
                        </div>
                    ))}

                    <div className="full-width-field">
                        <TextInput
                            htmlFor="coordinates"
                            label="Coordinates"
                            id="coordinates"
                            type="text"
                            className={errors.coordinates ? 'error-invoice-text-field' : 'invoice-text-field'}
                            labelClassName="invoice-label-text"
                            placeholder="Coordinates"
                            onChange={handleChange}
                            name="coordinates"
                            value={employeeDetails.coordinates}
                            mandatory="*"
                        />
                        {errors.coordinates && <p className="error-msg">{errors.coordinates}</p>}
                    </div>


                    <div className="bottom-form-section">
                        <div className="full-width-field">
                            <label htmlFor="employeeAddress" className="invoice-label-text">
                                {formatLabel('employeeAddress')} <span style={{ color: '#e62e28' }}>*</span>
                            </label>
                            <textarea
                                id="employeeAddress"
                                name="employeeAddress"
                                className={errors.employeeAddress ? 'error-invoice-text-field' : 'invoice-textarea-field'}
                                placeholder="Enter address"
                                value={employeeDetails.employeeAddress}
                                onChange={handleChange}
                                style={{ height: '70px' }}
                            />
                            {errors.employeeAddress && <p className="error-msg">{errors.employeeAddress}</p>}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="location" className="invoice-label-text">
                            {formatLabel('Work Location')} <span style={{ color: '#e62e28' }}>*</span>
                        </label>
                        <select
                            name="location"
                            value={officeLocation}
                            onChange={(e)=> setOfficeLocation(e.target.value)}
                            className='invoice-textarea-field'
                        >
                            <option value="">Select</option>
                            {LocationList.map(v => (
                                <option key={v.id} value={v.location_name}>
                                    {v.location_name} - {v.location_code}
                                </option>
                            ))}
                        </select>
                        {errors.location && <p className="error-msg">{errors.location}</p>}
                    </div>
                </div>

                <div className="new-invoice-actions-button-container">
                    <Button type="submit" className="secondary-button" text={employee ? 'Update' : 'Save'} />
                </div>
            </form>
        </div>
    );
};

export default AddEmployeeDetails;
