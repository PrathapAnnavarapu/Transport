import React, { lazy, Suspense, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Cookies from 'js-cookie';
import Loader from './Components/Loader';
import './App.css';


const InvoiceUploadAuthuntication = lazy(() => import('./Pages/Invoices/UploadAuthuntication'));
const Invoices = lazy(() => import('./Pages/Invoices/Invoices'));
const Header = lazy(() => import('./Components/Header'));
const Status = lazy(() => import('./Pages/Invoices/UploadStatus'));
const Dashboard = lazy(() => import('./Pages/Dashboard'));
const Login = lazy(() => import('./Pages/Login'));
const Notifications = lazy(() => import('./Pages/Notifications'));
const ErrorBoundary = lazy(()=> import('./Components/ErrorBoundaries'))

function AppContent() {
  const Jwt = Cookies.get('jwt_token');
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // This should be dynamically set based on your authentication logic

  useEffect(() => {
    if (Jwt !== undefined) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [Jwt]);

  useEffect(() => {
    // Save the current path to local storage
    localStorage.setItem('lastPath', location.pathname);
  }, [location]);

  useEffect(() => {
    // On component mount, navigate to the last saved path
    const lastPath = localStorage.getItem('lastPath');
    if (lastPath) {
      navigate(lastPath, { replace: true });
    }
  }, [navigate]);

  return (
    <Suspense fallback={<Loader />}>
      <div className='main-home'>
        {isAuthenticated ? (
          <>
            <Header />
            <section>
              <Routes>
                <Route path='/Hughesnetwork/Management/Dashboard' element={<Dashboard />} key={location.pathname} />
                <Route path='/Hughesnetwork/Management/Invoices/Upload/Authuntication' element={<InvoiceUploadAuthuntication />} key={location.pathname} />
                <Route path='/Hughesnetwork/Management/Invoices/Upload' element={<Invoices />} key={location.pathname} />
                <Route path='/Hughesnetwork/Management/Invoices/Status' element={<Status />} key={location.pathname} />
                <Route path='/Hughesnetwork/Management/Notifications' element={<Notifications />} key={location.pathname} />
                <Route path='*' element={<Navigate to='/Hughesnetwork/Management/Dashboard' replace />} />
              </Routes>
            </section>
          </>
        ) : (
          <Routes>
            <Route path='/Hughesnetwork/Management/Login' element={<Login />} />
            <Route path='*' element={<Navigate to='/Hughesnetwork/Management/Login' replace />} />
          </Routes>
        )}
      </div>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;