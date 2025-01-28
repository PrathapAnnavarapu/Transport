import { useSelector, useDispatch } from "react-redux"
import { IoMdCloseCircle } from "react-icons/io";
import { useNavigate } from "react-router-dom";


const Notifications =() =>{
     const dispatch = useDispatch()
     const navigate = useNavigate()
     const notificationsData = useSelector((data)=> data.Notification) || []
    return(
        <div className="notifications-container">
            <h3 className="notifications-title">Notifications</h3>
            {notificationsData.length !== 0 ? (
                <ul>
                    {notificationsData.map((each) => (
                        <li key={each.invoiceNumber}>
                            <span className='notification-invoicenumber' onClick={()=> navigate(`/Hughesnetwork/Management/Invoices/${each.invoiceNumber}`)}>{each.invoiceNumber}</span> {each.text}
                            <IoMdCloseCircle className="notification-close-icon" onClick={()=> dispatch({type:'removeNotification', payload:each.invoiceNumber})} />
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="empty-notifications">
                    <img
                        src={process.env.PUBLIC_URL + '/Images/0z9cht9a.png'}
                        alt="notification"
                        className="no-notifications-icon"
                    />
                    {/* Uncomment this if you want to use the icon instead of the image */}
                    {/* <IoMdNotificationsOff className="no-notifications-icon" /> */}
                    <h4>No notifications yet</h4>
                </div>
            )}
        </div>


    )
}
export default Notifications