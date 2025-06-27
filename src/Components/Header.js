import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CiLogout } from "react-icons/ci";
import Cookies from 'js-cookie';
import Button from './Button';
import Popup from './Model';
import { jwtDecode } from 'jwt-decode';

const menuItems = [
    { title: 'Home', path: '/Employee/Dashboard', img: '/Images/8726049_home_alt_icon.png' },
    { title: 'Self', path:'/Employee/Schedules', img: '/Images/5094666_calendar_date_schedule_time_icon.png' },
    { title: 'SPOC', path:'/Employee/SPOC-Schedules', img: '/Images/5094666_calendar_date_schedule_time_icon.png' },
    { title: 'SPOC ', path:'/Admin/SPOC-Schedules', img: '/Images/6791598_calender_daedline_date_event_schedule_icon.png' },
    { title: 'Routing', path:['/Employeegrouped/pickup/SPOC-Schedules','/Employeegrouped/drop/SPOC-Schedules'], img: '/Images/3915763_location_maps_navigation_pin_route_icon.png' },   
    { title: 'Reports', path: ['/Employee/Details','/Vehicle/Details', '/Vehicle/Billing', '/Employee/Roaster/Report'], img: '/Images/8960618_reports_checkup_clipboard_hospital_doctor_icon.png', },    
    { title: 'More', path:['/Employee/Manage/Schedules','/Vechile/Billing-Policy'], img: '/Images/7324042_ui_interface_more_options_menu_icon.png', }
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
        const token = Cookies.get('jwt_token');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserDetails(decodedToken.sub);
        }
    }, []);

    
    // Filter menu items based on user role
    const filteredMenuItems = menuItems.filter(item => {
        if (userDetails.role === 'Admin') {
            return item.title !== 'SPOC';  // Admin sees all menu items
        }
        if (userDetails.role === 'superuser') {
            // Superuser sees all menu items except the ones meant for the user
            return item.title === 'Home' || item.title === 'SPOC Book&Sch' ||  item.title === 'Book&Sch'; 
        }
        if (userDetails.role === 'user') {
            // User only sees specific items
            return item.title === 'Home' || item.title === 'Self';  
        }        
        return false;
    });

    useEffect(() => {
        const currentPath = location.pathname;
        const activeItem = filteredMenuItems.find(item => Array.isArray(item.path) ? item.path.some(path => currentPath.includes(path)) : currentPath.includes(item.path));
        if (activeItem) {
            setActive(activeItem.title);
        }
    }, [location, filteredMenuItems]);

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
                <h2 className='hughes-logo' onClick={() => navigate('/Hughesnetwork-Management/Dashboard')}>RIDE</h2>
                <ul>
                    {filteredMenuItems.map((item) => (
                        <li
                            key={item.title}
                            className={item.title === active ? 'activeTabClass' : 'inactiveTabClass'}
                            onClick={() => handleNavigation(Array.isArray(item.path) ? item.path[0] : item.path)}
                        >
                            <div className="menu-item-content">
                                {item.img && <img src={item.img} alt={item.title} className="menu-item-icon" />}
                                <span>{item.icon}</span>
                                <h3>{item.title}</h3>
                            </div>

                            {/* Invoices Submenu */}
                            {item.title === 'Book&Sch' && (
                                <div
                                    className={`reports-submenu ${openSubmenu === 'invoices' ? 'show' : ''}`}
                                    onClick={(e) => e.stopPropagation()}  // Prevent event bubbling
                                >                                    
                                </div>
                            )}

                            {/* Billing Submenu */}
                            {item.title === 'Routing' && (
                                <div
                                    className={`reports-submenu ${openSubmenu === 'invoices' ? 'show' : ''}`}
                                    onClick={(e) => e.stopPropagation()}  // Prevent event bubbling
                                >
                                    <ul>
                                        <li onClick={() => handleNavigation('/Employeegrouped/pickup/SPOC-Schedules')}>
                                           Pickup Routing
                                        </li>
                                        <li onClick={() => handleNavigation('/Employeegrouped/drop/SPOC-Schedules')}>
                                           Drop Routing
                                        </li>
                                    </ul>
                                </div>
                            )}
                            {item.title === 'Reports' && (
                                <div
                                    className={`reports-submenu ${openSubmenu === 'invoices' ? 'show' : ''}`}
                                    onClick={(e) => e.stopPropagation()}  // Prevent event bubbling
                                >
                                    <ul>
                                        <li onClick={() => handleNavigation('/Employee/Details')}>
                                           Employee Details
                                        </li>
                                        <li onClick={() => handleNavigation('/Vehicle/Details')}>
                                           Vechile Details
                                        </li>
                                        <li onClick={() => handleNavigation('/Vehicle/Billing')}>
                                           Billing Details
                                        </li>
                                         <li onClick={() => handleNavigation('/Employee/Roaster/Report')}>
                                           Employee Roaster Audit Report
                                        </li>
                                    </ul>
                                </div>
                            )}
                             {item.title === 'More' && (
                                <div
                                    className={`reports-submenu ${openSubmenu === 'invoices' ? 'show' : ''}`}
                                    onClick={(e) => e.stopPropagation()}  // Prevent event bubbling
                                >
                                    <ul>
                                        <li onClick={() => handleNavigation('/Employee/Manage/Schedules')}>
                                           Manage Schedule Times
                                        </li>
                                        <li onClick={() => handleNavigation('/Vechile/Billing-Policy')}>
                                           Vehicle Billing Policy
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
                    <button className='profile-icon' data-tooltip="Profile">
                        <img src='/Images/4696674_account_avatar_male_people_person_icon.png' alt='avatar' style={{ width: '28px', height:'28px' }} />
                        <div className='profile-hover-menu'>
                            <ul>
                                <h4>{userDetails.employee_name}</h4>
                                <h5>{userDetails.role}</h5>
                                <h6>{userDetails.employee_email}</h6>

                                <li>Manage Profile</li>
                                <button className='logout-button' onClick={openPopup}><CiLogout /> Logout</button>
                            </ul>
                        </div>
                    </button>
                </div>
            </nav>
            {isLogoutClicked && (
                <Popup isOpen={true} onClose={closePopup}>
                    <h6 className='pop-up-text'>Do you want to logout?</h6>
                    <div className='status-buttons'>
                        <Button type='button' className='tertioary-button-main' text='Yes' onClick={() => { navigate('/'); Cookies.remove('jwt_token'); }} />
                        <Button type='button' className='tertioary-button' text='Close' onClick={closePopup} />
                    </div>
                </Popup>
            )}
        </header>
    );
};

export default React.memo(Header);
