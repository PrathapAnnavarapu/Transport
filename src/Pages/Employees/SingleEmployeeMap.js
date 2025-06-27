import React, { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import ApiComponent from '../../Components/API';
import 'leaflet/dist/leaflet.css';


const ORS_API_KEY = '5b3ce3597851110001cf6248b5bf2e59230248ed8975bc8a02758ae2';

// Custom icons
const DefaultIcon = L.icon({
  iconUrl: '/Images/3859117_app_gps_interface_location_map_icon.png',
  iconSize: [20, 25],
  iconAnchor: [12, 25],
});

const OfficeIcon = L.icon({
  iconUrl: '/Images/103179_gps_pin_map_location_marker_icon.png',
  iconSize: [25, 30],
  iconAnchor: [12, 30],
});

// Fetches the route and sets route + distance
const RouteFetcher = ({ waypoints, setRoute, setDistance }) => {
  const map = useMap();

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const coordinates = waypoints.map(([lat, lng]) => [lng, lat]);

        const res = await fetch(
          'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: ORS_API_KEY,
            },
            body: JSON.stringify({ coordinates }),
          }
        );

        const data = await res.json();

        const lineCoords = data.features[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );

        const distanceMeters = data.features[0].properties.summary.distance;

        setRoute(lineCoords);
        if (setDistance) setDistance(distanceMeters);

        const bounds = L.latLngBounds(lineCoords.map(([lat, lng]) => L.latLng(lat, lng)));
        map.fitBounds(bounds, { padding: [40, 40] });
      } catch (err) {
        console.error('Route fetch error:', err);
      }
    };

    if (waypoints.length >= 2) fetchRoute();
  }, [waypoints, setRoute, setDistance, map]);

  return null;
};

// Main map component
const SingleEmployeeMap = ({ employee, onUpdateSuccess, setDistance }) => {
  const [route, setRoute] = useState([]);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [apiProps, setApiProps] = useState(null);
  const employeeRef = useRef(employee);

 
  useEffect(() => {
    employeeRef.current = employee;

    if (
      employee?.latitude &&
      employee?.longitude &&
      !isNaN(employee.latitude) &&
      !isNaN(employee.longitude)
    ) {
      setMarkerPosition([employee.latitude, employee.longitude]);
    }
  }, [employee]);

  if (!markerPosition) return null;

  const officeCoords = [17.44164, 78.381263];
  const waypoints = [officeCoords, markerPosition];

  const handleDragEnd = async (event) => {
    const { lat, lng } = event.target.getLatLng();
    setMarkerPosition([lat, lng]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      const address = data.display_name;

      const currentEmployee = employeeRef.current;

      if (!isNaN(Number(currentEmployee?.employee_id))) {
        const postData = {
          latitude: lat,
          longitude: lng,
          employee_address: address,
        };

        setApiProps({
          method: 'PUT',
          url: `api/employee/update/${Number(currentEmployee.employee_id)}`,
          postData: postData,
          render: (response) => {
            if (response.status === 200) {
              if (onUpdateSuccess) onUpdateSuccess();
            }
          },
        });
      } else {
        console.error('Invalid employee ID:', currentEmployee?.employee_id);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: 8, overflow: 'hidden' }}>
      {apiProps && (
        <ApiComponent key={JSON.stringify(apiProps.postData)} {...apiProps} />
      )}
      <MapContainer center={markerPosition} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={officeCoords} icon={OfficeIcon} />
        <Marker
          position={markerPosition}
          icon={DefaultIcon}
          draggable={true}
          eventHandlers={{ dragend: handleDragEnd }}
        />
        <RouteFetcher
          waypoints={waypoints}
          setRoute={setRoute}
          setDistance={(distanceMeters) => {
            if (setDistance) {
              setDistance(distanceMeters / 1000); // convert to km
            }
          }}
        />
        {route.length > 0 && <Polyline positions={route} color="blue" weight={4} />}
      </MapContainer>      
      
    </div>
  );
};

export default SingleEmployeeMap;
