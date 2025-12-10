import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CiLogout } from "react-icons/ci";
import Cookies from 'js-cookie';
import Button from './Button';
import Popup from './Model';
import { jwtDecode } from 'jwt-decode';
import ToastComponent from './Toast';
import ApiComponent from './API'



const menuItems = [
    { title: 'Home', path: '/Employee/Dashboard', img: '/Images/8726049_home_alt_icon.png' },
    { title: 'Self', path: '/Employee/Schedules', img: '/Images/5094666_calendar_date_schedule_time_icon.png' },
    { title: 'SPOC', path: '/Employee/SPOC-Schedules', img: '/Images/5094666_calendar_date_schedule_time_icon.png' },
    { title: 'Schedules ', path: '/Admin/SPOC-Schedules', img: '/Images/6791598_calender_daedline_date_event_schedule_icon.png' },
    {
        title: 'Routing',
        submenu: [
            { title: 'Pickup', path: '/Employeegrouped/pickup/SPOC-Schedules' },
            { title: 'Drop', path: '/Employeegrouped/drop/SPOC-Schedules' }
        ],
        img: '/Images/3915763_location_maps_navigation_pin_route_icon.png'
    },
    {
        title: 'Reports',
        submenu: [
            { title: 'Employee Details', path: '/Employee/Details' },
            { title: 'Vehicle Details', path: '/Vehicle/Details' },
            { title: 'Vehicle Billing', path: '/Vehicle/Billing' },
            { title: 'Employee Roaster Report', path: '/Employee/Roaster/Report' }
        ],
        img: '/Images/8960618_reports_checkup_clipboard_hospital_doctor_icon.png',
    },
    {
        title: 'More',
        submenu: [
            { title: 'Manage Schedules', path: '/Employee/Manage/Schedules' },
            { title: 'Billing Policy', path: '/Vechile/Billing-Policy' },
            { title: 'Manage SPOC', path: '/Manage/SPOC' },
            { title: 'Manage Locations', path: '/Manage/Locations' }
        ],
        img: '/Images/7324042_ui_interface_more_options_menu_icon.png',
    }
];

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {error} = ToastComponent()
    const [active, setActive] = useState(menuItems[0].title);
    const [isLogoutClicked, setIsLogoutClicked] = useState(false);
    const [userDetails, setUserDetails] = useState({});
    const [openSubmenu, setOpenSubmenu] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState('')
    const [hasFetched, setHasFetched] = useState(false);
    const [locationsList, setLocationsList] = useState([])
    const [apiProps, setApiProps] = useState(null);

   
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

    useEffect(() => {
            if (!hasFetched) {
                setApiProps({
                    method: 'GET',
                    url: 'api/locations/all',
                    render: (response) => {
                        if (response?.data) {
                            setLocationsList(response.data);
                            setHasFetched(true); // prevent refetch loop
                        }
                    },
                    catchError: (err) => {
                        error(err?.response?.data?.error || 'Failed to fetch locations');
                    }
                });
            }
        }, [hasFetched]);

    const handleNavigation = (path) => {
        navigate(path);
        // Update active based on path
        const activeItem = filteredMenuItems.find(item => 
            item.submenu 
                ? item.submenu.some(sub => sub.path === path) 
                : item.path === path
        );
        if (activeItem) setActive(activeItem.title);
    };

    const handleSubmenuToggle = (submenuName) => {
        setOpenSubmenu(openSubmenu === submenuName ? null : submenuName);
    };

    // Filter menu items based on user role
    const filteredMenuItems = menuItems
        .map(item => {
            if (userDetails.role === 'SPOC') {
                if (item.title === 'Reports') {
                    return {
                        ...item,
                        submenu: item.submenu.filter(sub => sub.path === '/Employee/Roaster/Report')
                    };
                }
                if (item.title === 'SPOC' || item.title === 'Self') return item;
                return null;
            }
            if (userDetails.role === 'Admin') return item.title !== 'SPOC' && item.title !== 'Location' ? item : null;
            if (userDetails.role === 'Super Admin') return item.title !== 'SPOC' ? item : null;
            if (userDetails.role === 'user') return (item.title === 'Home' || item.title === 'Self') ? item : null;
            return null;
        })
        .filter(Boolean);

    useEffect(() => {
        const currentPath = location.pathname;
        const activeItem = filteredMenuItems.find(item => 
            item.submenu 
                ? item.submenu.some(sub => sub.path === currentPath) 
                : item.path === currentPath
        );
        if (activeItem) setActive(activeItem.title);
    }, [location, filteredMenuItems]);

    const openPopup = () => setIsLogoutClicked(true);
    const closePopup = () => setIsLogoutClicked(false);

    return (
        <header className="header-main">
            {apiProps && <ApiComponent {...apiProps} />}
            <div>
                <img src='/Images/TEP.PA_BIG.png' alt='logo' className='hughes-logo' style={{ width: '135px', height: '28px' }}/>
                {/* <h2 className='hughes-logo' onClick={() => navigate('/Hughesnetwork-Management/Dashboard')}>RIDE</h2> */}
                <ul>
                    {filteredMenuItems.map((item) => (
                        <li
                            key={item.title}
                            className={item.title === active ? 'activeTabClass' : 'inactiveTabClass'}
                            onClick={() => {
                                if (!item.submenu) {
                                    handleNavigation(Array.isArray(item.path) ? item.path[0] : item.path);
                                } else {
                                    handleSubmenuToggle(item.title);
                                }
                            }}
                        >
                            <div className="menu-item-content">
                                {item.img && <img src={item.img} alt={item.title} className="menu-item-icon" />}
                                <span>{item.icon}</span>
                                <h3>{item.title}</h3>
                            </div>

                            {/* Dynamic submenu rendering */}
                            {item.submenu && (
                                <div
                                    className={`reports-submenu ${openSubmenu === item.title ? 'show' : ''}`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ul>
                                        {item.submenu.map(sub => (
                                            <li key={sub.path} onClick={() => handleNavigation(sub.path)}>
                                                {sub.title}
                                            </li>                                            
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <nav>
                <div>
                    {userDetails.role === 'Super Admin' && 
                    <select
                    name="spocName"
                    value={selectedLocation}
                    onChange={(e)=> setSelectedLocation(e.target.value)}
                    className="location-dropdown-field"
                >
                    <option value="">All</option>
                    {locationsList.map(v => (
                        <option key={v.id} value={v.location_name}>
                            {v.location_name} - {v.location_code}
                        </option>
                    ))}
                </select> }


                    <button className='profile-icon' data-tooltip="Profile">
                        <img src='/Images/4696674_account_avatar_male_people_person_icon.png' alt='avatar' style={{ width: '28px', height: '28px' }} />
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
