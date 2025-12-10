import React, { useEffect, useRef, useState } from 'react';
import Button from '../../Components/Button';
import ApiComponent from '../../Components/API';
import ToastComponent from '../../Components/Toast';

const AddSpocDetails = () => {
    const { error, success } = ToastComponent();
    const [errors, setErrors] = useState({});
    const [apiProps, setApiProps] = useState(null);
    const [hasFetched, setHasFetched] = useState(false);
    const [employeeList, setEmployeeList] = useState([]);
    const [employeeDetails, setEmployeeDetails] = useState({ spocName: '' });

    const isSavingRef = useRef(false); // ✅ replaces isSaving state

    // ✅ exact match
    const selctedSpoc = employeeList.find(
        (each) => each.employee_name === employeeDetails.spocName
    );
    console.log('Selected SPOC:', selctedSpoc);

    const requiredFields = ['spocName'];

    const validateForm = (values) => {
        const errs = {};
        requiredFields.forEach(field => {
            if (!values[field] || values[field].trim() === '') {
                errs[field] = `${field} is required!`;
            }
        });
        return errs;
    };

    useEffect(() => {
        if (!hasFetched) {
            setApiProps({
                method: 'GET',
                url: 'api/employees/all',
                render: (response) => {
                    if (response?.data && Array.isArray(response.data)) {
                        setEmployeeList(response.data);
                        setHasFetched(true);
                    }
                    setApiProps(null);
                },
                catchError: (err) => {
                    error(err?.response?.data?.error || 'Failed to fetch employee list');
                    setApiProps(null);
                }
            });
        }
    }, [hasFetched, error]);

    // ✅ Save SPOC with validation + useRef lock
    const handleSaveSpoc = () => {
        const validationErrors = validateForm(employeeDetails);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0 && selctedSpoc && !isSavingRef.current) {
            isSavingRef.current = true; // ✅ lock until finished
            setApiProps({
                method: 'POST',
                url: 'api/add/new/spoc',
                postData: selctedSpoc,
                render: (response) => {
                    success(response.data?.message || 'SPoC Name saved successfully');
                    setEmployeeDetails({ spocName: '' });
                    isSavingRef.current = false; // ✅ unlock
                    setApiProps(null);
                },
                catchError: (err) => {
                    error(err?.response?.data?.error || 'Failed to save SPoC Name');
                    isSavingRef.current = false; // ✅ unlock
                    setApiProps(null);
                }
            });
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setEmployeeDetails(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({
            ...prev,
            [name]: value.trim() === '' ? 'This field is required' : ''
        }));
    };

    return (
        <div className="create-invoice-fields-container">
            {apiProps && <ApiComponent {...apiProps} />}

            <form className="form-results-container" onSubmit={(e) => e.preventDefault()}>
                <select
                    name="spocName"
                    value={employeeDetails.spocName}
                    onChange={handleChange}
                    className="spoc-dropdown-field"
                >
                    <option value="">Select</option>
                    {employeeList.map(v => (
                        <option key={v.id} value={v.employee_name}>
                            {v.employee_name} - {v.employee_id}
                        </option>
                    ))}
                </select>
                {errors.spocName && <p className="error-msg">{errors.spocName}</p>}

                <div className="new-invoice-actions-button-container">
                    <Button
                        type="button"
                        className="secondary-button"
                        text="Save"
                        onClick={handleSaveSpoc} // ✅ now safe from double call
                    />
                </div>
            </form>
        </div>
    );
};

export default AddSpocDetails;
