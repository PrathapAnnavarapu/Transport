import React, { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Loader from './Components/Loader';
import ToastComponent from './Components/Toast';
import './App.css';

const Login = lazy(() => import('./Pages/Authuntication'));
const Mainmenu = lazy(() => import('./Pages/Mainmenu'));
const Header = lazy(() => import('./Components/Header'));
const Main = lazy(() => import('./Pages/Main'));
const Status = lazy(() => import('./Pages/Status'));
const Dashboard = lazy(() => import('./Pages/Dashboard'))

function AppContent() {
  const { error } = ToastComponent();
  const isAuthenticated = true; // This should be dynamically set based on your authentication logic
  const location = useLocation();
  const navigate = useNavigate();

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
                <Route path='/Hughesnetwork/Management/Invoices' element={<Mainmenu />} key={location.pathname} />                
                <Route path='/Hughesnetwork/Management/Invoices/Status' element={<Status />} key={location.pathname} />
                <Route path='/Hughesnetwork/Management/Billing' element={<Status />} key={location.pathname} />
                <Route path='/Hughesnetwork/Management/Billing/Accounts' element={<Status />} key={location.pathname} />
                <Route path='*' element={<Navigate to='/Hughesnetwork/Management/Home' replace />} />
              </Routes>
            </section>
          </>
        ) : (
          <Routes>
            <Route path='/Hughesnetwork/Management/Authentication' element={<Login />} />
            <Route path='*' element={<Navigate to='/Hughesnetwork/Management/Authentication' replace />} />
          </Routes>
        )}
      </div>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
