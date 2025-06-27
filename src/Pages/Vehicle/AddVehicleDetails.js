import React, { useState, useEffect } from "react";
import Button from "../../Components/Button";
import TextInput from '../../Components/TextInput';
import ToastComponent from "../../Components/Toast";
import ApiComponent from '../../Components/API';
import Dropdown from '../../Components/Dropdown'; // Assuming Dropdown component is in the same location

const AddVehicleDetails = ({setIsPopupOpen}) => {
    const { error, success } = ToastComponent();
    const [billingModes, setBillingModes] = useState([]);

    const [vehicleDetails, setVehicleDetails] = useState({
        vehicleNumber: '',
        vendorType: '',
        vendorName: '',
        vehicleOwnerName: '',
        vehicleDriverName: '',
        vehicleName: '',
        vehicleModel: '',
        vehicleOwnerMobileNo: '',
        vehicleDriverMobileNo: '',
        vehicleOwnerAddress: '',
        vehicleDriverAddress: '',
        billingMode: '', // Store the selected billing_mode name here
        billingPolicyId: String('') // Store the selected billing_policy_id here (hidden from UI)
    });

 

    const [errors, setErrors] = useState({});
    const [isSubmit, setIsSubmit] = useState(false);
    const [apiProps, setApiProps] = useState(null);

    const validateForm = (values) => {
        const requiredFields = Object.keys(vehicleDetails);
        const errors = {};

        requiredFields.forEach(field => {
            if (!values[field]) errors[field] = `${field} is required`;
        });

        return errors;
    };

    useEffect(() => {
        if (billingModes.length === 0) {
            setApiProps({
                method: 'GET',
                url: 'api/get/billing-policies/names',
                render: (response) => {
                    if (response && response.data) {
                        // Assuming response.data is an array of objects with `billing_mode` and `id`
                        setBillingModes(response.data);
                    } else {
                        console.error('Response or response.data is undefined');
                    }
                }
            });
        }
    }, [billingModes]);

    useEffect(() => {
        if (Object.keys(errors).length === 0 && isSubmit) {
            const payload = {
                vechile_number: vehicleDetails.vehicleNumber,
                vendor_type: vehicleDetails.vendorType,
                vendor_name: vehicleDetails.vendorName,
                vechile_owner_name: vehicleDetails.vehicleOwnerName,
                vechile_driver_name: vehicleDetails.vehicleDriverName,
                vechile_name: vehicleDetails.vehicleName,
                vechile_model: vehicleDetails.vehicleModel,
                vechile_owner_mobile_no: vehicleDetails.vehicleOwnerMobileNo,
                vechile_driver_mobile_no: vehicleDetails.vehicleDriverMobileNo,
                vechile_owner_address: vehicleDetails.vehicleOwnerAddress,
                vechile_driver_address: vehicleDetails.vehicleDriverAddress,
                billing_mode: vehicleDetails.billingMode,
                billing_policy_id: vehicleDetails.billingPolicyId, // Send the billing_policy_id (hidden from UI)
            };

          
            setApiProps({
                method: 'POST',
                url: 'api/create/vechile',
                postData: payload,
                render: (response) => {
                    success(response?.data?.message || 'Vehicle added successfully');
                    setVehicleDetails({
                        vehicleNumber: '',
                        vendorType: '',
                        vendorName: '',
                        vehicleOwnerName: '',
                        vehicleDriverName: '',
                        vehicleName: '',
                        vehicleModel: '',
                        vehicleOwnerMobileNo: '',
                        vehicleDriverMobileNo: '',
                        vehicleOwnerAddress: '',
                        vehicleDriverAddress: '',
                        billingMode: '',
                        billingPolicyId: '' // Reset billingPolicyId
                    });
                    setApiProps(null);
                    if (setIsPopupOpen) setIsPopupOpen(false);                    
                },
                catchError: (err) => {
                    error(err?.response?.data?.error || 'Failed to add vehicle');
                }
            });

            setIsSubmit(false);
        }
    }, [errors, isSubmit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVehicleDetails(prev => ({ ...prev, [name]: value }));

        if (value.trim() !== '') {
            setErrors(prev => ({ ...prev, [name]: '' }));
        } else {
            setErrors(prev => ({ ...prev, [name]: `${name} is required` }));
        }
    };

    const handleDropdownChange = (e) => {
        const { name, value } = e.target;

        // Find the billing_mode object based on the selected value
        const selectedBillingMode = billingModes.find(mode => mode.billing_mode === value);

        setVehicleDetails(prev => ({
            ...prev,
            [name]: value, // Set the billing_mode name
            billingPolicyId: selectedBillingMode?.id || '', // Set the billing_policy_id (hidden from UI)
        }));

        if (value.trim() !== '') {
            setErrors(prev => ({ ...prev, [name]: '' }));
        } else {
            setErrors(prev => ({ ...prev, [name]: `${name} is required` }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors(validateForm(vehicleDetails));
        setIsSubmit(true);
    };

    return (
        <div className='create-invoice-fields-container'>
            {apiProps && <ApiComponent {...apiProps} />}
            <form className='form-results-container'>
                <div className='invoice-summary-input-fields'>
                    {Object.entries(vehicleDetails).map(([key, value]) => {
                        if (key === 'billingMode') {
                            // Use the Dropdown for billingMode with same input class
                            return (
                                <div key={key}>
                                    <Dropdown
                                        options={billingModes.map(mode => mode.billing_mode)} // Map to just the billing_mode names
                                        className={errors[key] ? 'error-invoice-text-field' : 'invoice-text-field'} // Same class for styling
                                        htmlFor={key}
                                        labelClassName="invoice-label-text"
                                        label="Billing Mode"
                                        onChange={handleDropdownChange}
                                        name={key}
                                        value={value}
                                        dropDownList="billingModesList"
                                        placeholder="Select Billing Mode"
                                        mandatory="*"
                                        style={{height:'40px'}}
                                    />
                                    {errors[key] && <p className="error-msg">{errors[key]}</p>}
                                </div>
                            );
                        } else if (key !== 'billingPolicyId') {
                            // Exclude billingPolicyId from UI rendering
                            return (
                                <div key={key}>
                                    <TextInput
                                        htmlFor={key}
                                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        id={key}
                                        type='text'
                                        className={errors[key] ? 'error-invoice-text-field' : 'invoice-text-field'} // Same class for styling
                                        labelClassName='invoice-label-text'
                                        placeholder={key}
                                        onChange={handleChange}
                                        name={key}
                                        value={value}
                                        mandatory='*'
                                    />
                                    {errors[key] && <p className="error-msg">{errors[key]}</p>}
                                </div>
                            );
                        }
                    })}
                </div>
                <div className='new-invoice-actions-button-container'>
                    <Button type='button' className='secondary-button' text='Save' onClick={handleSubmit}/>
                </div>
            </form>
        </div>
    );
};

export default React.memo(AddVehicleDetails);
