import React, { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,  
} from "react-router-dom";

import Loader from './Components/Loader';
import ToastComponent from './Components/Toast';
import './App.css';

const Login = lazy(() => import('./Pages/Authuntication'));
const Home = lazy(()=> import('./Pages/Home/Sidemenu'))

function App() {
  const { error } = ToastComponent();
  const isAuthenticated = true;

  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <div className='app'>
          {isAuthenticated ? (
            <section className='home-container'>            
              <Routes>
                <Route path='/Hughesnetwork/Management/Home' element={<Home/>} />
                <Route path='*' element={<Navigate to='/Hughesnetwork/Management/Home' replace />} />
              </Routes>
            </section>
          ) : (
            <Routes>
              <Route path='/Hughesnetwork/Management/Authentication' element={<Login />} />
              <Route path='*' element={<Navigate to='/Hughesnetwork/Management/Authentication' replace />} />
            </Routes>
          )}
        </div>
      </Suspense>
    </Router>
  );
}

export default App;