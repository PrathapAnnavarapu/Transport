import React,{ useEffect, useState, useCallback, useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ✅ ORS API Key (replace with yours if needed)
const ORS_API_KEY = '5b3ce3597851110001cf6248b5bf2e59230248ed8975bc8a02758ae2';

// ✅ Default marker icon (employee)
const DefaultIcon = L.icon({
  iconUrl: '/Images/3859117_app_gps_interface_location_map_icon.png',
  iconSize: [20, 25],
  iconAnchor: [12, 25],
});

// ✅ Office marker icon (source)
const OfficeIcon = L.icon({
  iconUrl: '/Images/103179_gps_pin_map_location_marker_icon.png',
  iconSize: [25, 30],
  iconAnchor: [12, 30],
});

// ✅ Routing fetcher component
const RouteFetcher = ({ waypoints, setRoute }) => {
  const map = useMap();

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const coordinates = waypoints.map(([lat, lng]) => [lng, lat]);

        const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: ORS_API_KEY,
          },
          body: JSON.stringify({ coordinates }),
        });

        const data = await res.json();

        const lineCoords = data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);

        setRoute(lineCoords);

        // Fit bounds
        const bounds = L.latLngBounds(lineCoords.map(pos => L.latLng(pos[0], pos[1])));
        map.fitBounds(bounds, { padding: [50, 50] });

      } catch (err) {
        console.error('Routing error:', err);
      }
    };

    if (waypoints.length >= 2) fetchRoute();
  }, [waypoints, setRoute, map]);

  return null;
};

const ClusterMapModal = ({ clusterData, onClose }) => {
  const [route, setRoute] = useState([]);

  if (!clusterData) return null;

  const sortedEmployees = [...clusterData].sort(
    (a, b) => (a.pickup_sequence || 0) - (b.pickup_sequence || 0)
  );

  const employeeCoords = sortedEmployees
    .map(emp => emp.employee_coordinates)
    .filter(
      coords =>
        Array.isArray(coords) &&
        coords.length === 2 &&
        typeof coords[0] === 'number' &&
        typeof coords[1] === 'number'
    );

  // ✅ Define the source (e.g., your office)
  const source = [17.441640, 78.381263]; // Customize if needed
  const isPickupRoute = sortedEmployees.some(emp => emp.pickup_sequence === 1); // Check if it's pickup route

  let waypoints;
  let displayEmployees = [...sortedEmployees];

  if (isPickupRoute) {
    // Pickup route: Start from the first employee to the office, and include all employees
    waypoints = [employeeCoords[0], ...employeeCoords.slice(1), source];
  } else {
    // Drop route: Start from the office to the last employee
    waypoints = [source, ...employeeCoords.reverse()];
    displayEmployees = displayEmployees.reverse(); // Reverse the display order for drop
  }

  const center = waypoints[0];

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>✖</button>
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* ✅ Source (Office) Marker */}
          <Marker position={source} icon={OfficeIcon}>
            <Popup>
              <strong>Office</strong><br />
              Starting Point
            </Popup>
          </Marker>

          {/* ✅ Employee Markers */}
          {displayEmployees.map(emp => (
            <Marker
              key={emp.employee_id}
              position={emp.employee_coordinates}
              icon={DefaultIcon}
            >
              <Popup>
                <strong>{emp.employee_name}</strong><br />
                {emp.employee_address}<br />
                Seq: {emp.pickup_sequence}
              </Popup>
            </Marker>
          ))}

          {/* ✅ Fetch & Draw Route */}
          <RouteFetcher waypoints={waypoints} setRoute={setRoute} />

          {/* ✅ Display Route Line */}
          {route.length > 0 && (
            <Polyline positions={route} color="blue" weight={4} />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default ClusterMapModal;

































// import React,{ useEffect, useState, useCallback, useMemo } from 'react'
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   Polyline,
//   useMap
// } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// // ✅ ORS API Key (replace with yours if needed)
// const ORS_API_KEY = '5b3ce3597851110001cf6248b5bf2e59230248ed8975bc8a02758ae2';

// // ✅ Default marker icon (employee)
// const DefaultIcon = L.icon({
//   iconUrl: '/Images/3859117_app_gps_interface_location_map_icon.png',
//   iconSize: [20, 25],
//   iconAnchor: [12, 25],
// });

// // ✅ Office marker icon (source)
// const OfficeIcon = L.icon({
//   iconUrl: '/Images/103179_gps_pin_map_location_marker_icon.png',
//   iconSize: [25, 30],
//   iconAnchor: [12, 30],
// });

// // ✅ Routing fetcher component
// const RouteFetcher = ({ waypoints, setRoute }) => {
//   const map = useMap();

//   useEffect(() => {
//     const fetchRoute = async () => {
//       try {
//         const coordinates = waypoints.map(([lat, lng]) => [lng, lat]);

//         const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: ORS_API_KEY,
//           },
//           body: JSON.stringify({ coordinates }),
//         });

//         const data = await res.json();

//         const lineCoords = data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);

//         setRoute(lineCoords);

//         // Fit bounds
//         const bounds = L.latLngBounds(lineCoords.map(pos => L.latLng(pos[0], pos[1])));
//         map.fitBounds(bounds, { padding: [50, 50] });

//       } catch (err) {
//         console.error('Routing error:', err);
//       }
//     };

//     if (waypoints.length >= 2) fetchRoute();
//   }, [waypoints, setRoute, map]);

//   return null;
// };

// const ClusterMapModal = ({ clusterData, onClose }) => {
//   const [route, setRoute] = useState([]);

//   if (!clusterData) return null;

//   const sortedEmployees = [...clusterData].sort(
//     (a, b) => (a.pickup_sequence || 0) - (b.pickup_sequence || 0)
//   );

//   const employeeCoords = sortedEmployees
//     .map(emp => emp.employee_coordinates)
//     .filter(
//       coords =>
//         Array.isArray(coords) &&
//         coords.length === 2 &&
//         typeof coords[0] === 'number' &&
//         typeof coords[1] === 'number'
//     );

//   // ✅ Define the source (e.g., your office)
//   const source = [17.441640, 78.381263]; // Customize if needed
//   const waypoints = [source, ...employeeCoords];
//   const center = waypoints[0];

//   return (
//     <div className="modal-backdrop">
//       <div className="modal-content">
//         <button className="close-btn" onClick={onClose}>✖</button>
//         <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
//           <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//           {/* ✅ Source (Office) Marker */}
//           <Marker position={source} icon={OfficeIcon}>
//             <Popup>
//               <strong>Office</strong><br />
//               Starting Point
//             </Popup>
//           </Marker>

//           {/* ✅ Employee Markers */}
//           {sortedEmployees.map(emp => (
//             <Marker
//               key={emp.employee_id}
//               position={emp.employee_coordinates}
//               icon={DefaultIcon}
//             >
//               <Popup>
//                 <strong>{emp.employee_name}</strong><br />
//                 {emp.employee_address}<br />
//                 Seq: {emp.pickup_sequence}
//               </Popup>
//             </Marker>
//           ))}

//           {/* ✅ Fetch & Draw Route */}
//           <RouteFetcher waypoints={waypoints} setRoute={setRoute} />

//           {/* ✅ Display Route Line */}
//           {route.length > 0 && (
//             <Polyline positions={route} color="blue" weight={4} />
//           )}
//         </MapContainer>
//       </div>
//     </div>
//   );
// };

// export default ClusterMapModal;
