import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdCircleNotifications } from "react-icons/md";
import { AiFillQuestionCircle } from "react-icons/ai";
import { MdOutlineAccountCircle } from "react-icons/md";
import Cookies from 'js-cookie'
import Button from './Button';
import Popup from './Model';
import {jwtDecode} from 'jwt-decode';


const menuItems = [
    { title: 'Home', path: '/Hughesnetwork/Management/Dashboard' },
    { title: 'Invoices', path: '/Hughesnetwork/Management/Invoices' },
    { title: 'Billing', path: '/Hughesnetwork/Management/Billing' },
    { title: 'More', path: '/Hughesnetwork/Management/More' }
];

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [active, setActive] = useState(menuItems[0].title);
    const [isLogoutClicked, setIsLogoutClicked] = useState(false);
    const [userDetails, setUserDetails] = useState({})

    const handleNavigation = (path) => {
        const activeItem = menuItems.find(item => item.path === path);
        if (activeItem) {
            setActive(activeItem.title);
        }
        navigate(path);
    };

    useEffect(() => {
        const token = Cookies.get('jwt_token')// Replace with your actual JWT token
        const decodedToken = jwtDecode(token);
        setUserDetails(decodedToken.sub)         
      }, []);

    useEffect(() => {
        const currentPath = location.pathname;
        const activeItem = menuItems.find(item => currentPath.includes(item.path));
        if (activeItem) {
            setActive(activeItem.title);
        }
    }, [location]);




    const openPopup = () => {
        setIsLogoutClicked(true);
    };

    const closePopup = () => {
        setIsLogoutClicked(false);
    };


    return (
        <header className="header-main">
            <div>
                <ul>
                    {menuItems.map((item) => (
                        <li
                            key={item.title}
                            onMouseEnter={() => setActive(item.title)}
                            onMouseLeave={() => setActive('')}
                            className={item.title === active ? 'activeTabClass' : 'inactiveTabClass'}
                        >
                            <span>{item.icon}</span>
                            <h3>{item.title}</h3>

                            {/* Invoices Submenu (show on hover) */}
                            {item.title === 'Invoices' && active === 'Invoices' && (
                                <div className="reports-submenu">
                                    <ul>
                                        <li>Load Invoices
                                            {/* Nested submenu for "Load Invoices" */}
                                            <div className="reports-sub-submenu">
                                                <ul>
                                                    <li onClick={() => handleNavigation('/Hughesnetwork/Management/Invoices/Upload/Authuntication')}>Upload</li>
                                                    <li onClick={() => handleNavigation('/Hughesnetwork/Management/Invoices/Status')}>Status</li>
                                                </ul>
                                            </div>
                                        </li>
                                        <li>Summary</li>
                                        <li>Department</li>
                                    </ul>
                                </div>
                            )}
                            {/* Billing Submenu (show on hover) */}
                            {item.title === 'Billing' && active === 'Billing' && (
                                <div className="more-submenu">
                                    <ul>
                                        <li onClick={() => handleNavigation('/Hughesnetwork/Management/Billing/Accounts')}>Accounts</li>
                                        <li onClick={() => handleNavigation('/Hughesnetwork/Management/Billing/CostCenters')}>Cost Centers</li>
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <nav>
                <div>
                    <a href="#" data-tooltip="Notifications" className="notification">
                        <div className="notification-count-none"></div>
                        <MdCircleNotifications />
                    </a>
                    <a href="#" data-tooltip="FAQ" className="notification">
                        <AiFillQuestionCircle />
                    </a>
                    <button className='profile-icon' data-tooltip="Profile">
                        <MdOutlineAccountCircle style={{fontSize:'28px'}}/>
                        <div className='profile-hover-menu'>
                            <ul>
                                <h3>{userDetails.username}</h3>
                                <li>Manage Profile</li>
                                <Button className='logout-button' text='Logout' onClick={() => openPopup()} />
                                
                            </ul>
                        </div>
                        {/* <div className='profile-name-and-role-details'>
                                <h4>Prathap</h4>
                                <h6>User</h6>
                            </div> */}
                    </button>
                </div>                
            </nav>  
            {isLogoutClicked && (
                <Popup isOpen={true} onClose={closePopup}>
                    <h6 className='pop-up-text'>Do you want to logout?</h6>
                    <div className='status-buttons'>
                        <Button type='button' className='primary-button' text='Yes' onClick={() => { navigate('/Hughesnetwork/Management/Login'); Cookies.remove('jwt_token') }} />
                        <Button type='button' className='primary-button' text='Close' onClick={closePopup} />
                    </div>
                </Popup>
            )}         
        </header>        
    );
};

export default React.memo(Header);
