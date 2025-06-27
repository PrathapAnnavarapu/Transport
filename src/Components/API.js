

import React, { useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import Loader from './Loader';
import ToastComponent from '../Components/Toast';

const ApiComponent = ({ method, url, postData, render, contentType = 'application/json', onError }) => {
  const { error } = ToastComponent();
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true); // avoid triggering useEffect

  useEffect(() => {
    isMountedRef.current = true;

    const fetchData = async () => {
      try {
        const token = Cookies.get('jwt_token');
        const endPoint = `http://127.0.0.1:5001/${url}`;

        const isFormData = postData instanceof FormData;
        const headers = {
          'Authorization': `Bearer ${token}`,
        };

        if (!isFormData) {
          headers['Content-Type'] = contentType;
        }

        const config = { headers };
        setLoading(true);

        let response;
        switch (method) {
          case 'GET':
            response = await axios.get(endPoint, config);
            break;
          case 'POST':
            response = await axios.post(endPoint, postData, config);
            break;
          case 'PUT':
            response = await axios.put(endPoint, postData, config);
            break;
          case 'DELETE':
            response = await axios.delete(endPoint, config);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        if (isMountedRef.current) {
          setLoading(false);
          render(response);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setLoading(false);
          if (onError) {
            onError(err);
          } else {
            error(err?.response?.data?.message || 'Something went wrong');
          }
        }
      }
    };

    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, [method, url, postData, contentType]); // don't include render/onError in deps

  if (loading) return <div><Loader /></div>;

  return null;
};

export default React.memo(ApiComponent);













// import React, { useEffect, useState, useCallback } from 'react';
// import Cookies from 'js-cookie';
// import axios from 'axios';
// import Loader from './Loader'
// import ToastComponent from '../Components/Toast'

// const ApiComponent = ({ method, url, postData, render }) => {
//   const { error } = ToastComponent()
//   const [loading, setLoading] = useState(true);
//   const [isMounted, setIsMounted] = useState(true); // To handle component unmount

//   const fetchData = useCallback(async () => {
//     try {
//       const token = Cookies.get('jwt_token');
//       const endPoint = `http://127.0.0.1:5001/${url}`;
//       const config = {
//         headers: {
//           'Content-Type': 'application/json',
//           // 'Content-Type':'multipart/form-data',
//           'Authorization': `Bearer ${token}`,
//         },
//       };
//       setLoading(true); // Start loading state

//       let response;

//       switch (method) {
//         case 'GET':
//           response = await axios.get(endPoint, config);
//           break;
//         case 'POST':
//           response = await axios.post(endPoint, postData, config);
//           break;
//         case 'PUT':
//           response = await axios.put(endPoint, postData, config);
//           break;
//         case 'DELETE':
//           response = await axios.delete(endPoint, config); 
//           break;
//         default:
//           throw new Error(`Unsupported method: ${method}`);
//       }

//       if (isMounted) {    
//         setLoading(false);   
//         render(response);
        
//       }
//     } catch (err) {
//       if (isMounted) {
//         setLoading(false);
//         error(err?.response?.data?.message)
        
//       }
//     }
//   }, [method, url, postData, render, isMounted]);

//   useEffect(() => {
//     setIsMounted(true);
//     fetchData();

//     return () => setIsMounted(false); // Clean up on unmount
//   }, [fetchData]);

//   if (loading) return <div><Loader /></div>;
//   // if (error) return <div>Error: {error.message}</div>;
//   return null;
// };

// export default React.memo(ApiComponent);