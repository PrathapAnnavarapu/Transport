import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdCircleNotifications } from "react-icons/md";
import { AiFillQuestionCircle } from "react-icons/ai";

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

    const handleNavigation = (path) => {
        const activeItem = menuItems.find(item => item.path === path);
        if (activeItem) {
            setActive(activeItem.title);
        }
        navigate(path);
    };

    useEffect(() => {
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
        </header>
    );
};

export default React.memo(Header);
