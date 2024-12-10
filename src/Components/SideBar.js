
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation} from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { MdDashboard } from "react-icons/md";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { MdInventory } from "react-icons/md";
import { FaFirstOrder } from "react-icons/fa6";
import { CiBoxes } from "react-icons/ci";
import { TbReportSearch } from "react-icons/tb";
import { CgMore } from "react-icons/cg";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight} from "react-icons/md";


const menuItems = [
    { title: 'Home', icon: <MdDashboard />, path: 'Hughesnetwork/Management/Dashboard' },
    { title: 'Invoices', icon: <LiaFileInvoiceSolid />, path: 'Hughesnetwork/Management/Invoices' },
    { title: 'Inventory', icon: <MdInventory />, path: 'Hughesnetwork/Management/Inventory' },
    { title: 'Vendors', icon: <CiBoxes />, path: 'Hughesnetwork/Management/Vendors' },
    // { title: 'Orders', icon: <FaFirstOrder />, path: 'Hughesnetwork/Management/Orders' },
    // { title: 'Reports', icon: <TbReportSearch />, path: 'Hughesnetwork/Management/Reports' },
    { title: 'More', icon: <CgMore />, path: 'Hughesnetwork/Management/More' }
];

const SideBar = () => {    
    const navigate = useNavigate()
    const location = useLocation();
    const dispatch = useDispatch()
    const [active, setActive] = useState(menuItems[0].title)

    const toggleSideBarStatus = useSelector((state)=> state.SideBarStatus)

    const handleNaviagation = (path) => {
        if (path === 'Hughesnetwork/Management/Dashboard' || path === 'Hughesnetwork/Management/Vendors' || path === 'Hughesnetwork/Management/Orders' || path === 'Hughesnetwork/Management/Invoices' || path === 'Hughesnetwork/Management/Inventory') {
            navigate(path);
            setActive(menuItems.find(item => item.path === path).title);
        }
    }

    useEffect(() => {
        // Set active menu item based on current path
        const currentPath = location.pathname;
        const activeItem = menuItems.find(item => currentPath.includes(item.path));
        if (activeItem) {
            setActive(activeItem.title);
        }
    }, [location]);

    useEffect(() => {
        // Set default route here
        navigate(menuItems[0].path);
    }, []);


    return (        
        <ul className={toggleSideBarStatus ? "sidebar-component-minimize": "sidebar-component"}>           
            {toggleSideBarStatus ?  <MdKeyboardDoubleArrowRight className='right-arrow' onClick={() => dispatch({type:'maximize_the_side_bar'})}/> : <MdKeyboardDoubleArrowLeft className='left-arrow' onClick={() => dispatch({type:'minimize_the_side_bar'})}/>}
            {menuItems.map((each) => (
                <li key={each.title} onClick={() => { handleNaviagation(each.path); setActive(each.title) }} className={each.title === active ? 'activeClass' : ''}>
                    <span>{each.icon}</span>
                    <h3>{each.title}</h3>
                    {(each.title === 'Reports' && active === 'Reports') && (
                        <div className='reports-submenu'>
                            <ul>
                                <li onClick={() => navigate('Hughesnetwork/Management/Reports/Dynamic')}>Dynamic</li>
                                <li onClick={() => navigate('Hughesnetwork/Management/Reports/Summary')}>Summary</li>
                                <li onClick={() => navigate('Hughesnetwork/Management/Reports/Department')}>Department</li>
                                <li>Budget</li>
                                <li>AIM360</li>
                            </ul>
                        </div>
                    )}
                    {(each.title === 'More' && active === 'More') && (
                        <div className='more-submenu'>
                            <ul>
                                <li onClick={() => navigate('Hughesnetwork/Management/More/Accounts')}>Accounts</li>
                                <li onClick={() => navigate('Hughesnetwork/Management/More/CostCenters')}>Cost Centers</li>
                                <li>Deprecated Inventory</li>
                                <li>Exceptions</li>
                                <li>Import</li>
                                <li>Locations</li>
                                <li onClick={() => navigate('Hughesnetwork/Management/More/Notifications')}>Notifications</li>
                                <li>Splits</li>
                                <li>Tax Mapping</li>
                            </ul>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    )
}

export default React.memo(SideBar)