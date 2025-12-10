import React, { useEffect, useState } from 'react';
import TextInput from '../../Components/TextInput';
import Button from '../../Components/Button';
import ApiComponent from '../../Components/API';
import ToastComponent from '../../Components/Toast';

const AddLocationDetails = ({ location, onSuccess }) => {
    const { error, success } = ToastComponent();
    const [errors, setErrors] = useState({});
    const [apiProps, setApiProps] = useState(null);

    const initialLocationDetails = {
        locationName: '',
        locationCode: '',
        address: '',
        city: '',
        state: '',
        country: '',
        isActive: true
    };

    const [locationDetails, setLocationDetails] = useState(initialLocationDetails);

    // ✅ Sync selected location → form state
    useEffect(() => {
        if (location) {
            setLocationDetails({
                locationName: location.location_name || '',
                locationCode: location.location_code || '',
                address: location.address || '',
                city: location.city || '',
                state: location.state || '',
                country: location.country || '',
                isActive: location.is_active ?? true
            });
        } else {
            setLocationDetails(initialLocationDetails);
        }
    }, [location]);

    const requiredFields = ['locationName', 'locationCode', 'address', 'city', 'state', 'country'];

    const validateForm = (values) => {
        const errs = {};
        requiredFields.forEach(field => {
            if (!values[field]) {
                errs[field] = `${field} is required!`;
            }
        });
        return errs;
    };

    // ✅ Call API once on Save
    const handleSaveLocation = () => {
        const formErrors = validateForm(locationDetails);
        setErrors(formErrors);

        if (Object.keys(formErrors).length > 0) return; // stop if validation fails

        const method = location ? 'PUT' : 'POST';
        const url = location
            ? `api/locations/update/${location.id}`
            : 'api/add/new/location';

        setApiProps({
            method,
            url,
            postData: locationDetails,
            render: (response) => {
                success(
                    response.data?.msg ||
                    (location ? 'Location updated successfully' : 'Location added successfully')
                );

                setLocationDetails(initialLocationDetails);

                // ⚡ don't reset apiProps, prevents double call
                if (onSuccess) onSuccess(); // notify parent
            },
            catchError: (err) => {
                error(err?.response?.data?.error || 'Failed to save location');
            }
        });
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setLocationDetails(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setErrors(prev => ({
            ...prev,
            [name]: value.trim() === '' && requiredFields.includes(name) ? 'This field is required' : ''
        }));
    };

    const formatLabel = (key) =>
        key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

    return (
        <div className="create-invoice-fields-container">
            {/* ✅ ApiComponent triggers only once */}
            {apiProps && <ApiComponent {...apiProps} />}

            <form className="form-results-container" onSubmit={(e) => e.preventDefault()}>
                <div className="location-summary-input-fields">

                    {['locationName', 'locationCode', 'city', 'state', 'country'].map((key) => (
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
                                value={locationDetails[key]}
                                mandatory={requiredFields.includes(key) ? '*' : ''}
                            />
                            {errors[key] && <p className="error-msg">{errors[key]}</p>}
                        </div>
                    ))}

                    {/* Active Status */}
                    <div className="full-width-field">
                        <label className="invoice-label-text">Active Status</label>
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={locationDetails.isActive}
                            onChange={handleChange}
                        /> Active
                    </div>

                    {/* Address field */}
                    <div className="full-width-field">
                        <label htmlFor="address" className="invoice-label-text">
                            Address <span style={{ color: '#e62e28' }}>*</span>
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            className={errors.address ? 'error-invoice-text-field' : 'invoice-textarea-field'}
                            placeholder="Enter address"
                            value={locationDetails.address}
                            onChange={handleChange}
                            style={{ height: '70px' }}
                        />
                        {errors.address && <p className="error-msg">{errors.address}</p>}
                    </div>
                </div>

                <div className="new-invoice-actions-button-container">
                    <Button
                        type="button"
                        className="secondary-button"
                        text={location ? 'Update' : 'Save'}
                        onClick={handleSaveLocation}
                    />
                </div>
            </form>
        </div>
    );
};

export default AddLocationDetails;
