import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GiHamburgerMenu } from "react-icons/gi";
import { MdCancel } from "react-icons/md";
import { MdCircleNotifications } from "react-icons/md";
import { AiFillQuestionCircle } from "react-icons/ai";
import Cookies from 'js-cookie'
import Popup from './Model';
import Button from './Button';

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userInfo = useSelector((state) => state.userInfo) || {}
    const username = userInfo.userName || '';
    const formattedUserName = username ? username.slice(0, 1).toUpperCase() + username.slice(1).toLowerCase() : '';

    const firstCharacter = userInfo?.userName?.slice(0, 2).toUpperCase();
    const notificationsLength = useSelector((data) => data.Notification).length
    const [toggleIcon, setToggleIcon] = useState(false);
    const [isLogoutClicked, setIsLogoutClicked] = useState(false);

    const toggleSideBarStatus = useSelector((state)=> state.SideBarStatus)



    const openPopup = () => {
        setIsLogoutClicked(true);
    };

    const closePopup = () => {
        setIsLogoutClicked(false);
    };


    return (
        <header>
            {/* <div className='logo-container'>
                <h1 className='sm-logo'>H</h1>
                <img src={process.env.PUBLIC_URL + '/Images/Hughes_Network_Systems-Logo.wine.png'} alt='hughes' className='logo' />
            </div> */}
            <nav className={toggleSideBarStatus ? 'maximize-header': 'normal-header' }>
                <div className='nav-action-buttons'>
                <a href='#' data-tooltip="Notifications" className='notificaton' onClick={() => navigate('/Hughesnetwork/Management/More/Notifications')}><div className={notificationsLength !== 0 ? 'notification-count' : 'notification-count-none'}>{notificationsLength}</div><MdCircleNotifications /></a>
                <a href='#' data-tooltip="Faq's" onClick={() => navigate('/Hughesnetwork/Management/More/Faqs')}><AiFillQuestionCircle /></a>

                <button className='avatar-profile-button' data-tooltip="Profile">
                    <div className='avatar-profile-and-details'>
                        <div className='avatar-profile'>
                            {firstCharacter}
                            <div className='hover-profile-details'>
                                <div className='hover-profile-details-description'>
                                    <h5>{formattedUserName}@hughes.com</h5>
                                    <img src={process.env.PUBLIC_URL + '/Images/Avatar-PNG-Image.png'} alt="img" />
                                    <h3>{formattedUserName}</h3>
                                    <h4>{userInfo.role}</h4>
                                </div>
                                <ul>
                                    <li>Manage Profile</li>
                                    <span className='logout-button' onClick={()=>openPopup()}>Log Out</span>
                                </ul>
                            </div>
                        </div>
                        <div className='profile-name-and-role-details'>
                            <h4>{formattedUserName}</h4>
                            <h6>{userInfo.role}</h6>
                        </div>
                    </div>
                </button>
                {isLogoutClicked && (
                    <Popup isOpen={true} onClose={closePopup}>
                        <h6 className='pop-up-text'>Do you want to logout?</h6>
                        <div className='logout-options'>
                            <Button type='button' className='tertioary-buttton' text='Yes' onClick={() => { Cookies.remove('jwt_token'); dispatch({ type: 'LOGOUT' }); dispatch({ type: 'LOGOUT_Payload' }); dispatch({ type: 'closeNotification' }); closePopup(); navigate('/Hughesnetwork/login'); localStorage.removeItem('notificationsState') }} />
                            <Button type='button' className='fourth-buttton' text='Close' onClick={closePopup} />
                        </div>
                    </Popup>
                )}
                </div>
            </nav>
            {/* <button type='button' id='hamburger-menu' className={toggleIcon ? 'active' : undefined} onClick={() => setToggleIcon(!toggleIcon)}>
                {toggleIcon ? <MdCancel /> : <GiHamburgerMenu />}
            </button> */}
        </header>
    );
}

export default React.memo(Header);
