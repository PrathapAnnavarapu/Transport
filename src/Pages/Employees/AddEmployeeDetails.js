import React,{ useEffect, useState, useCallback, useMemo } from 'react'
import TextInput from '../../Components/TextInput';
import Button from '../../Components/Button';
import ApiComponent from '../../Components/API';
import ToastComponent from '../../Components/Toast';

const AddEmployeeDetails = () => {
    const { error, success } = ToastComponent();
    const [isSubmit, setIsSubmit] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiProps, setApiProps] = useState(null);

    const initialEmployeeDetails = {
        employeeName: '',
        employeeEmail: '',
        employeeMobileNo: '',
        gender: '',
        employeeId: '',
        role: '',
        process: '',
        pocName: '',
        pocMobileNo: '',
        employeeAddress: '',
        coordinates: ''
    };

    const [employeeDetails, setEmployeeDetails] = useState(initialEmployeeDetails);

    const requiredFields = [
        'employeeName', 'employeeEmail', 'employeeMobileNo', 'gender',
        'employeeId', 'role', 'process', 'employeeAddress', 'coordinates'
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
            setApiProps({
                method: 'POST',
                url: 'api/add/new/employee',
                postData: employeeDetails,
                render: (response) => {
                    success(response.data?.msg || 'Employee added successfully');
                    setEmployeeDetails(initialEmployeeDetails);
                    setApiProps(null);
                },
                catchError: (err) => {
                    error(err?.response?.data?.error || 'Failed to add employee');
                }
            });
            setIsSubmit(false);
        }
    }, [errors, isSubmit]);

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

    // Fields except address and coordinates
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
                </div>
                <div className="new-invoice-actions-button-container">
                    <Button type="submit" className="secondary-button" text="Save" />
                </div>
            </form>
        </div>
    );
};

export default AddEmployeeDetails;
