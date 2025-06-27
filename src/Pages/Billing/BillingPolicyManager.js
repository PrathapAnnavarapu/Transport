import React,{ useEffect, useState, useCallback, useMemo } from 'react'
import ApiComponent from '../../Components/API';
import Popup from '../../Components/Model';
import Button from '../../Components/Button';
import AddBillingPolicy from './AddBillingPolicy';
import ToastComponent from '../../Components/Toast';

const BillingPolicyManager = () => {
  const { success } = ToastComponent();
  const [policies, setPolicies] = useState([]);
  const [apiProps, setApiProps] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  
  const fetchPolicies = () => {
    setApiProps({
      method: 'GET',
      url: 'api/get/billing-policies',
      render: (response) => {
        if (response.data) {
          setPolicies(response.data);
        }
      },
    });
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const deletePolicy = (id) => {
    setApiProps({
      method: 'DELETE',
      url: `api/delete/billing-policies/${id}`,
      render: (response) => {
        if (response.status === 200) {
          success(response.data?.message)
        }
        fetchPolicies();
      },
    });
  };

  const updatePolicy = (id) => {
    setApiProps({
      method: 'PUT',
      url: `api/update/billing-policies/${id}`,
      render: (response) => {
        if (response.status === 200) {
          success(response.data?.message)
        }
        fetchPolicies();
      },
    });
  };

  return (
    <div className="BillingPolicyManager">
      {apiProps && <ApiComponent {...apiProps} />}

      <div className="action-buttons-container">
        <h2>Existing Policies</h2>
        <Button
          type="button"
          text="Add +"
          onClick={() => setIsPopupOpen(true)}
          className="primary-button"
        />
      </div>
      <ul>
        {policies.map((policy) => (
          <li key={policy.id} className="policy-card">
            <div className="policy-header">
              <strong>{policy.billing_mode}</strong>
            </div>

            <div className="policy-body">
              {/* Left: Zones Table */}
              <div className="policy-zones">
                {policy.billing_mode.toLowerCase().includes('zone') && policy.zones?.length > 0 && (
                  <>
                    <h4>Zones</h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Zone Name</th>
                          <th>Min Distance (km)</th>
                          <th>Max Distance (km)</th>
                          <th>Fixed Price (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {policy.zones.map((zone) => (
                          <tr key={zone.id}>
                            <td>{zone.zone_name}</td>
                            <td>{zone.distance_min}</td>
                            <td>{zone.distance_max}</td>
                            <td>₹{zone.fixed_price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>

              {/* Right: Billing Summary */}
              <div className="billing-summary">
                <h4>Billing Summary</h4>
                <div>Base Fare: ₹{policy.base_fare}</div>
                <div>Rate/km: ₹{policy.rate_per_km}</div>
                <div>Rate/min: ₹{policy.rate_per_min}</div>
                <div>Night Surcharge: {policy.night_surcharge_multiplier}x</div>
                <div>Monthly Fee: ₹{policy.monthly_fee}</div>
                <div>Included Rides: {policy.included_rides}</div>
                <div>Extra Ride Price: ₹{policy.extra_ride_price}</div>
                <div>Status: {policy.is_active ? 'Active' : 'Inactive'}</div>                
              </div>
              <Button
                  type="button"
                  text="Delete"
                  onClick={() => deletePolicy(policy.id)}
                  className="danger-button"
                  style={{ marginTop: '10px' }}
                />
                <Button
                  type="button"
                  text="Update"
                  onClick={() => updatePolicy(policy.id)}
                  className="danger-button"
                  style={{ marginTop: '10px' }}
                />
            </div>
          </li>

        ))}
      </ul>

      <Popup isOpen={isPopupOpen} onClose={() => { setIsPopupOpen(false); fetchPolicies() }} specialClass={true}>
        <AddBillingPolicy onSuccess={fetchPolicies} />
      </Popup>
    </div>
  );
};

export default BillingPolicyManager;
