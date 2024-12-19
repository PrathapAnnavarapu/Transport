import React, { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Loader from './Components/Loader';
import ToastComponent from './Components/Toast';
import './App.css';

const Login = lazy(() => import('./Pages/Authuntication'));
const Mainmenu = lazy(() => import('./Pages/Mainmenu'));
const Header = lazy(() => import('./Components/Header'));
const Main = lazy(()=> import('./Pages/Main'))

function App() {
  const { error } = ToastComponent();
  const isAuthenticated = true; // This should be dynamically set based on your authentication logic

  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <Suspense fallback={<Loader/>}>
        <div className='main-home'>          
          {isAuthenticated ? (
            <><Header />
            <section>
              <Routes>
                <Route path='/Hughesnetwork/Management/Home' element={<Mainmenu />} />
                <Route path='*' element={<Navigate to='/Hughesnetwork/Management/Home' replace />} />
              </Routes>
            </section></>
          ) : (
            <Routes>
              <Route path='/Hughesnetwork/Management/Authentication' element={<Login />} />
              <Route path='*' element={<Navigate to='/Hughesnetwork/Management/Authentication' replace />} />
            </Routes>
          )}
        </div>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;