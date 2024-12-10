import React, { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import Loader from './Loader'
import ToastComponent from '../Components/Toast'

const ApiComponent = ({ method, url, postData, render }) => {
  const { error } = ToastComponent()
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true); // To handle component unmount

  const fetchData = useCallback(async () => {
    try {
      const token = Cookies.get('jwt_token');
      const endPoint = `http://vmwhnstemdev01.nadops.net:8080/${url}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      setLoading(true); // Start loading state

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

      if (isMounted) {
        setLoading(false);
        render(response);

      }
    } catch (err) {
      if (isMounted) {
        error(err.response.data.message)
        setLoading(false);
      }
    }
  }, [method, url, postData, render, isMounted]);

  useEffect(() => {
    setIsMounted(true);
    fetchData();

    return () => setIsMounted(false); // Clean up on unmount
  }, [fetchData]);

  if (loading) return <div><Loader /></div>;
  // if (error) return <div>Error: {error.message}</div>;
  return null;
};

export default React.memo(ApiComponent);


// http://vmwhnstemdev01.nadops.net:8080/
// http://localhost:8080/