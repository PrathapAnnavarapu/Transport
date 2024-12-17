import React, { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Loader from './Components/Loader';
import ToastComponent from './Components/Toast';
import Sidemenu from './Pages/Mainmenu'
import './App.css';

const Login = lazy(() => import('./Pages/Authuntication'));
// const Sidemenu = lazy(() => import('./Pages/Mainmenu'));
const Header = lazy(() => import('./Components/Header'));

function App() {
  const { error } = ToastComponent();
  const isAuthenticated = true; // This should be dynamically set based on your authentication logic

  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <div className='main-home'>
          <Header />
          {isAuthenticated ? (
            <section>
              <Routes>
                <Route path='/Hughesnetwork/Management/Home' element={<Sidemenu />} />
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