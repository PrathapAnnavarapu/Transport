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
import { jwtDecode } from 'jwt-decode';
import './App.css';


const SPOCSchedules = lazy(() => import('./Pages/Schedules/SPOC-Schedules'));
const SPOCScheduleManager = lazy(() => import('./Pages/Schedules/ScheduleManager'));
const AdminSPOCSchedules = lazy(() => import('./Pages/Schedules/SPOC-Schedules-admin'))
const BillingPolicy = lazy(() => import('./Pages/Billing/BillingPolicyManager'))
const EmployeesList = lazy(() => import('./Pages/Employees/EmployeesList'))
const EmployeeDetails = lazy(() => import('./Pages/Employees/EmployeeDetails'))
const VehicleDetails = lazy(() => import('./Pages/Vehicle/Vehicles'))
const SelfEmployeeSchedules = lazy(() => import('./Pages/Schedules/SelfEmployeeSchedules'))
const PickupGroupedSchedules = lazy(() => import('./Pages/Routing/PickupRouting'))
const DropGroupedSchedules = lazy(() => import('./Pages/Routing/DropRouting'))
const RoutingInitialize = lazy(() => import('./Pages/Routing/RouteInitializing'))
const BillingReport = lazy(() => import('./Pages/Billing/BillingDetails'))
const EmployeeRoasterAuditReport = lazy(() => import('./Pages/AuditPages/EmployeeRoasterAudit'))
const Header = lazy(() => import('./Components/Header'));
const Dashboard = lazy(() => import('./Pages/Dashboard'));
const Login = lazy(() => import('./Pages/Login'));
const Signup = lazy(() => import('./Pages/Signup'))
const Notifications = lazy(() => import('./Pages/Notifications'));
const ErrorBoundary = lazy(() => import('./Components/ErrorBoundaries'))
const ManageSpocs = lazy(() => import('./Pages/Spocs/Spocs'))
const LocationsList = lazy(()=> import('./Pages/Locations/LocationsList'))

function AppContent() {
  const Jwt = Cookies.get('jwt_token');
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // This should be dynamically set based on your authentication logic
  const [userDetails, setUserDetails] = useState({});

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


  useEffect(() => {
    const token = Cookies.get('jwt_token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserDetails({
        employee_id: decodedToken.sub,
        employee_name: decodedToken.employee_name,
        employee_email: decodedToken.employee_email,
        role: decodedToken.role
      });
    }
  }, []);

  return (
    <Suspense fallback={<Loader />}>
      <div className='main-home'>
        {isAuthenticated ? (
          <>
            <Header />
            <section>
              <Routes>
                <Route path='/Employee/Dashboard' element={<Dashboard />} key={location.pathname} />
                <Route path='/Employee/Schedules' element={<SelfEmployeeSchedules />} key={location.pathname} />
                <Route path='/Employee/Manage/Schedules' element={<SPOCScheduleManager />} key={location.pathname} />
                <Route path='/Vechile/Billing-Policy' element={<BillingPolicy />} key={location.pathname} />
                <Route path='/Employee/SPOC-Schedules' element={<SPOCSchedules />} key={location.pathname} />
                <Route path='/Employeegrouped/pickup/SPOC-Schedules' element={<PickupGroupedSchedules />} key={location.pathname} />
                <Route path='/Employeegrouped/drop/SPOC-Schedules' element={<DropGroupedSchedules />} key={location.pathname} />
                <Route path='/Employee/Routing/Initialization' element={<RoutingInitialize />} key={location.pathname} />
                <Route path='/Admin/SPOC-Schedules' element={<AdminSPOCSchedules />} key={location.pathname} />
                <Route path='/Employee/Details' element={<EmployeesList />} key={location.pathname} />
                <Route path='/Employee/Details/:id' element={<EmployeeDetails />} key={location.pathname} />
                <Route path='/Employee/Roaster/Report' element={<EmployeeRoasterAuditReport />} key={location.pathname} />
                <Route path='/Vehicle/Details' element={<VehicleDetails />} key={location.pathname} />
                <Route path='/Vehicle/Billing' element={<BillingReport />} key={location.pathname} />
                <Route path='/Manage/SPOC' element={<ManageSpocs />} key={location.pathname} />
                <Route path='/Manage/Locations' element={<LocationsList />} key={location.pathname} />
                <Route path='*' element={<Navigate to='/Employee/Dashboard' replace />} />
              </Routes>
            </section>
          </>
        ) : (
          <Routes>
            <Route path='/' element={<Login />} />
            <Route path="/employee/signup" element={<Signup />} />
            <Route path='*' element={<Navigate to='/' replace />} />
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