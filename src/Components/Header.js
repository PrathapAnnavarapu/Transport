import React, { useState } from 'react';
import { MdCircleNotifications } from "react-icons/md";
import { AiFillQuestionCircle } from "react-icons/ai";


const Header = () => {

    return (
        <header className='header-main'>
            <nav>
                <div className='nav-action-buttons'>
                <a href='' data-tooltip="Notifications" className='notificaton'><div className='notification-count-none'></div><MdCircleNotifications /></a>
                <a href='' data-tooltip="Faq's"><AiFillQuestionCircle /></a>
                </div>
            </nav>
            {/* <button type='button' id='hamburger-menu' className={toggleIcon ? 'active' : undefined} onClick={() => setToggleIcon(!toggleIcon)}>
                {toggleIcon ? <MdCancel /> : <GiHamburgerMenu />}
            </button> */}
        </header>
    );
}

export default React.memo(Header);
