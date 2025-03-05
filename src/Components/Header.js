import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdCircleNotifications } from "react-icons/md";
import { AiFillQuestionCircle } from "react-icons/ai";
import { MdOutlineAccountCircle } from "react-icons/md";
import { FaAngleRight } from "react-icons/fa";
import Cookies from 'js-cookie';
import Button from './Button';
import Popup from './Model';
import { jwtDecode } from 'jwt-decode';

const menuItems = [
    { title: 'Home', path: '/Hughesnetwork-Management/Dashboard' },
    { title: 'Invoices', path: ['/Hughesnetwork-Management/Invoices', '/Hughesnetwork-Management/Invoices/Upload-Status'] },
    { title: 'Billing', path: ['/Hughesnetwork-Management/Billing', '/Hughesnetwork-Management/Billing/Accounts', '/Hughesnetwork-Management/Billing/CostCenters'] },
    { title: 'More', path: ['/Hughesnetwork-Management/More', '/Hughesnetwork-Management/Notifications', '/Hughesnetwork-Management/FAQ'] }  // Add Notifications and FAQ paths here
];

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [active, setActive] = useState(menuItems[0].title);
    const [isLogoutClicked, setIsLogoutClicked] = useState(false);
    const [userDetails, setUserDetails] = useState({});
    const [openSubmenu, setOpenSubmenu] = useState(null);

    const handleNavigation = (path) => {
        const activeItem = menuItems.find(item => Array.isArray(item.path) ? item.path.includes(path) : item.path === path);
        if (activeItem) {
            setActive(activeItem.title);
        }
        navigate(path);
    };

    useEffect(() => {
        const token = Cookies.get('jwt_token'); // Replace with your actual JWT token
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserDetails(decodedToken.sub);
        }
    }, []);

    useEffect(() => {
        const currentPath = location.pathname;
        const activeItem = menuItems.find(item => Array.isArray(item.path) ? item.path.some(path => currentPath.includes(path)) : currentPath.includes(item.path));
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

    const handleSubmenuToggle = (submenuName) => {
        setOpenSubmenu(openSubmenu === submenuName ? null : submenuName);
    };

    return (
        <header className="header-main">
            <div>
                <h2 className='hughes-logo'>EBRM</h2>
                <ul>
                    {menuItems.map((item) => (
                        <li
                            key={item.title}
                            className={item.title === active ? 'activeTabClass' : 'inactiveTabClass'}
                            onClick={() => handleNavigation(Array.isArray(item.path) ? item.path[0] : item.path)}
                        >
                            <span>{item.icon}</span>
                            <h3>{item.title}</h3>

                            {/* Invoices Submenu */}
                            {item.title === 'Invoices' && (
                                <div
                                    className={`reports-submenu ${openSubmenu === 'invoices' ? 'show' : ''}`}
                                    onClick={(e) => e.stopPropagation()}  // Prevent event bubbling
                                >
                                    <ul>
                                        <li>
                                            Load Invoices <FaAngleRight className='right-arrow'/>
                                            <div
                                                className={`reports-sub-submenu ${openSubmenu === 'invoices-upload' ? 'show' : ''}`}
                                                onClick={(e) => e.stopPropagation()}  // Prevent event bubbling
                                            >
                                                <ul>
                                                    <li onClick={() => handleNavigation('/Hughesnetwork-Management/Invoices/Upload-Authuntication')}>Upload</li>
                                                    <li onClick={() => handleNavigation('/Hughesnetwork-Management/Invoices/Upload-Status')}>Status</li>
                                                </ul>
                                            </div>
                                        </li>
                                        <li onClick={() => handleNavigation('/Hughesnetwork-Management/Invoices/Summary')}>Summary</li>
                                        <li onClick={() => handleNavigation('/Hughesnetwork-Management/Invoices/Department')}>Department</li>
                                    </ul>
                                </div>
                            )}

                            {/* Billing Submenu */}
                            {item.title === 'Billing' && (
                                <div
                                className={`reports-submenu ${openSubmenu === 'invoices' ? 'show' : ''}`}
                                onClick={(e) => e.stopPropagation()}  // Prevent event bubbling
                            >
                                <ul>
                                    <li>
                                        Additional <FaAngleRight className='right-arrow'/>
                                        <div
                                            className={`reports-sub-submenu ${openSubmenu === 'invoices-upload' ? 'show' : ''}`}
                                            onClick={(e) => e.stopPropagation()}  // Prevent event bubbling
                                        >
                                            <ul>
                                                <li onClick={() => handleNavigation('/Hughesnetwork-Management/Billing/Option 1')}>Option 1</li>
                                                <li onClick={() => handleNavigation('/Hughesnetwork-Management/Billing/Option 2')}>Option2</li>
                                            </ul>
                                        </div>
                                    </li>                                   
                                </ul>
                             </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <nav>
                <div>
                    <a href="/Hughesnetwork-Management/Notifications" data-tooltip="Notifications" className="notification">
                        <div className="notification-count-none"></div>
                        <MdCircleNotifications />
                    </a>
                    <a href="#" data-tooltip="FAQ" className="notification">
                        <AiFillQuestionCircle />
                    </a>
                    <button className='profile-icon' data-tooltip="Profile">
                        <MdOutlineAccountCircle style={{ fontSize: '28px' }} />
                        <div className='profile-hover-menu'>
                            <ul>
                                <h3>{userDetails.username}</h3>
                                <li>Manage Profile</li>
                                <Button className='logout-button' text='Logout' onClick={openPopup} />
                            </ul>
                        </div>
                    </button>
                </div>
            </nav>
            {isLogoutClicked && (
                <Popup isOpen={true} onClose={closePopup}>
                    <h6 className='pop-up-text'>Do you want to logout?</h6>
                    <div className='status-buttons'>
                        <Button type='button' className='primary-button' text='Yes' onClick={() => { navigate('/Hughesnetwork-Management/Login'); Cookies.remove('jwt_token'); }} />
                        <Button type='button' className='primary-button' text='Close' onClick={closePopup} />
                    </div>
                </Popup>
            )}
        </header>
    );
};

export default React.memo(Header);
