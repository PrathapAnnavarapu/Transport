import React, { useState, useRef, useCallback } from "react";
import Button from "../../Components/Button";
import TextInput from "../../Components/TextInput";
import ApiComponent from "../../Components/API";
import Dropdown from "../../Components/Dropdown";
import ToastComponent from "../../Components/Toast";

const billingModeOptions = [
    { label: "Distance-Based Pricing", value: "distancebased" },
    { label: "Subscription-Based Billing", value: "subscription" },
    { label: "Zone-based Billing", value: "zonebased" },
];

const AddBillingPolicy = () => {
    const { success } = ToastComponent();
    const [apiProps, setApiProps] = useState(null);
    const [selectedMode, setSelectedMode] = useState('');
    const [formData, setFormData] = useState({
        billing_mode: '',
        base_fare: 0.0,
        rate_per_km: 0.0,
        rate_per_min: 0.0,
        night_surcharge_multiplier: 1.0,
        zones: [{ zone_name: '', distance_min: 0.0, distance_max: 0.0, fixed_price: 0.0 }],
        plan_name: '',
        monthly_fee: 0.0,
        included_rides: 0,
        extra_ride_price: 0.0,
        is_active: true,
    });

    const [Errors, setErrors] = useState({});
    const isSubmitting = useRef(false);

    const handleChange = (e, index = null) => {
        const { name, value, type, checked } = e.target;

        if (name === 'billing_mode') {
            const selectedInternalValue = billingModeOptions.find(opt => opt.label === value)?.value || '';
            setSelectedMode(selectedInternalValue);
            setFormData(prev => ({ ...prev, billing_mode: value }));
            return;
        }

        if (index !== null) {
            const updatedZones = [...formData.zones];
            updatedZones[index][name] = value;
            setFormData(prev => ({
                ...prev,
                zones: updatedZones,
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const addZone = () => {
        setFormData(prev => ({
            ...prev,
            zones: [...prev.zones, { zone_name: '', distance_min: '', distance_max: '', fixed_price: '' }],
        }));
    };

    const removeZone = (index) => {
        const updatedZones = formData.zones.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            zones: updatedZones,
        }));
    };

    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        // Check if the form is already being submitted
        if (isSubmitting.current) return;

        // Set the flag to true to indicate submission is in progress
        isSubmitting.current = true;

        const internalMode = billingModeOptions.find(
            (opt) => opt.label === formData.billing_mode
        )?.label || '';
        const data = {
            ...formData,
            billing_mode: internalMode,
            base_fare: parseFloat(formData.base_fare || 0),
            rate_per_km: parseFloat(formData.rate_per_km || 0),
            rate_per_min: parseFloat(formData.rate_per_min || 0),
            night_surcharge_multiplier: parseFloat(formData.night_surcharge_multiplier || 1),
            zones: formData.zones.map((zone) => ({
                zone_name: zone.zone_name,
                distance_min: parseFloat(zone.distance_min || 0),
                distance_max: parseFloat(zone.distance_max || 0),
                fixed_price: parseFloat(zone.fixed_price || 0),
            })),
            monthly_fee: parseFloat(formData.monthly_fee || 0),
            included_rides: parseInt(formData.included_rides || 0, 10),
            extra_ride_price: parseFloat(formData.extra_ride_price || 0),
        };

        setApiProps({
            method: 'POST',
            url: 'api/add/billing-policies',
            postData: JSON.stringify(data),
            render: (response) => {
                isSubmitting.current = false; // Reset the flag after submission
                if (response.status === 200 || response.status === 201) {
                    setFormData({
                        billing_mode: '',
                        base_fare: '',
                        rate_per_km: '',
                        rate_per_min: '',
                        night_surcharge_multiplier: '',
                        zones: [{ zone_name: '', distance_min: '', distance_max: '', fixed_price: '' }],
                        plan_name: '',
                        monthly_fee: '',
                        included_rides: '',
                        extra_ride_price: '',
                        is_active: true,
                    });
                    success(response.data?.message);
                    setSelectedMode('');
                }
            },
        });
    },[success]);

    return (
        <form className="form-results-container" onSubmit={handleSubmit}>
            {apiProps && <ApiComponent {...apiProps} />}

            <div className="form-field">
                <Dropdown
                    htmlFor="billing_mode"
                    label="Billing Mode"
                    id="billing_mode"
                    name="billing_mode"
                    value={formData.billing_mode}
                    onChange={handleChange}
                    placeholder="Select Billing Mode"
                    className={Errors.billing_mode ? 'error-invoice-text-field' : 'invoice-dropdown-field'}
                    labelClassName="invoice-label-text"
                    dropDownList="billing_mode_list"
                    options={billingModeOptions.map(opt => opt.label)}
                    mandatory="*"
                />
                {Errors.billing_mode && <p className="error-msg">{Errors.billing_mode}</p>}
            </div>

            {selectedMode && (
                <div className="billing-policy-input-fields">
                    {(selectedMode === 'payperride' || selectedMode === 'distancebased') && (
                        <>
                            <div className="form-field">
                                <TextInput name="base_fare" label="Base Fare" value={formData.base_fare} onChange={handleChange} type="number" />
                            </div>
                            <div className="form-field">
                                <TextInput name="rate_per_km" label="Rate per KM" value={formData.rate_per_km} onChange={handleChange} type="number" />
                            </div>
                            <div className="form-field">
                                <TextInput name="rate_per_min" label="Rate per Minute" value={formData.rate_per_min} onChange={handleChange} type="number" />
                            </div>
                            <div className="form-field">
                                <TextInput name="night_surcharge_multiplier" label="Night Surcharge Multiplier" value={formData.night_surcharge_multiplier} onChange={handleChange} type="number" />
                            </div>
                        </>
                    )}

                    {selectedMode === 'zonebased' && (
                        <>
                            {formData.zones.map((zone, index) => (
                                <div key={index} className="zone-row" style={{ borderBottom: '1px solid #ccc', marginBottom: '1rem' }}>
                                    <div className="form-field">
                                        <TextInput name="zone_name" label="Zone Name" value={zone.zone_name} onChange={(e) => handleChange(e, index)} type="text" />
                                    </div>
                                    <div className="form-field">
                                        <TextInput name="distance_min" label="Distance Min" value={zone.distance_min} onChange={(e) => handleChange(e, index)} type="number" />
                                    </div>
                                    <div className="form-field">
                                        <TextInput name="distance_max" label="Distance Max" value={zone.distance_max} onChange={(e) => handleChange(e, index)} type="number" />
                                    </div>
                                    <div className="form-field">
                                        <TextInput name="fixed_price" label="Fixed Price" value={zone.fixed_price} onChange={(e) => handleChange(e, index)} type="number" />
                                    </div>
                                    {formData.zones.length > 1 && (
                                        <div className="form-field">
                                            <button type="button" onClick={() => removeZone(index)} className="remove-zone-button">X</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="form-field">
                                <button type="button" onClick={addZone} className="add-zone-button">+</button>
                            </div>
                        </>
                    )}

                    {selectedMode === 'subscription' && (
                        <>
                            <div className="form-field">
                                <TextInput name="plan_name" label="Plan Name" value={formData.plan_name} onChange={handleChange} type="text" />
                            </div>
                            <div className="form-field">
                                <TextInput name="monthly_fee" label="Monthly Fee" value={formData.monthly_fee} onChange={handleChange} type="number" />
                            </div>
                            <div className="form-field">
                                <TextInput name="included_rides" label="Included Rides" value={formData.included_rides} onChange={handleChange} type="number" />
                            </div>
                            <div className="form-field">
                                <TextInput name="extra_ride_price" label="Extra Ride Price" value={formData.extra_ride_price} onChange={handleChange} type="number" />
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Is Active Checkbox */}
            {formData.billing_mode && (
                <div className="form-field">
                    <label className="invoice-label-text" htmlFor="is_active">
                        <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                        />{" "}
                        Is Active
                    </label>
                </div>
            )}

            {formData.billing_mode && (
                <div className="new-invoice-actions-button-container">
                    <Button type="submit" text="Save" className="secondary-button" />
                </div>
            )}
        </form>
    );
};

export default AddBillingPolicy;
