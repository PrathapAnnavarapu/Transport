import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdCircleNotifications } from "react-icons/md";
import { AiFillQuestionCircle } from "react-icons/ai";
import Button from './Button';

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

    // Log active tab for debugging
    console.log(active);

    const handleNavigation = (path, e) => {
        // Prevent the click from bubbling up to parent <li> when it's a submenu item
        e.stopPropagation();

        // Set the active state based on the path
        const activeItem = menuItems.find(item => item.path === path);
        if (activeItem) {
            setActive(activeItem.title);
        }
        // Navigate to the given path
        navigate(path);
    };

    useEffect(() => {
        // Set active menu item based on the current location (path)
        const currentPath = location.pathname;
        const activeItem = menuItems.find(item => currentPath.includes(item.path));
        if (activeItem) {
            setActive(activeItem.title);
        }
    }, [location]);

    return (
        <header className="header-main">
            <nav>
                <div>
                    <a href="#" data-tooltip="Notifications" className="notification">
                        <div className="notification-count-none"></div>
                        <MdCircleNotifications />
                    </a>
                    <a href="#" data-tooltip="FAQ" className="notification">
                        <AiFillQuestionCircle />
                    </a>
                </div>
            </nav>
            <div>
                <ul>
                    {menuItems.map((item) => (
                        <li 
                            key={item.title} 
                            onClick={(e) => handleNavigation(item.path, e)} 
                            className={item.title === active ? 'activeTabClass' : 'inactiveTabClass'}
                        >
                            <span>{item.icon}</span>
                            <h3>{item.title}</h3>
                            {item.title === 'Invoices' && active === 'Invoices' && (
                                <div className="reports-submenu">
                                    <ul>
                                        <li onClick={(e) => handleNavigation('/Hughesnetwork/Management/Invoices/Status', e)}>Status</li>
                                        <li onClick={(e) => handleNavigation('/Hughesnetwork/Management/Invoices/Summary', e)}>Summary</li>
                                        <li onClick={(e) => handleNavigation('/Hughesnetwork/Management/Invoices/Department', e)}>Department</li>
                                    </ul>
                                </div>
                            )}
                            {item.title === 'Billing' && active === 'Billing' && (
                                <div className="more-submenu">
                                    <ul>
                                        <li onClick={(e) => handleNavigation('/Hughesnetwork/Management/Billing/Accounts', e)}>Accounts</li>
                                        <li onClick={(e) => handleNavigation('/Hughesnetwork/Management/Billing/CostCenters', e)}>Cost Centers</li>
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </header>
    );
};

export default React.memo(Header);
