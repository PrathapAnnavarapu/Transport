import {combineReducers} from 'redux'

import AuthReducer from './Reducers/AuthReducer'
import NotificationReducer from './Reducers/NotificationsReducer'
import userInfoReducer from './Reducers/userInfoReducer'
import InvoiceSummaryReducer from './Reducers/InvoiceSummaryReducer'
import InvoiceDetailsReducer from './Reducers/InvoiceDetailsReducer'
import InvoiceDetailsItemIDReducer from './Reducers/EditInvoiceDetailsReducer'
import UniqueItemIDReducer from './Reducers/UniqueItemIDreducer'
import InvoiceInventoryDetailsPopupReducer from './Reducers/InvoiceInventoryDetailsPopStatus'
import SideBarToggleStatus from './Reducers/SideBarToggleState'

const rootReducer = combineReducers({
    authuntication:AuthReducer, 
    Notification:NotificationReducer, 
    userInfo:userInfoReducer, 
    invoiceSummary:InvoiceSummaryReducer, 
    invoiceDetails:InvoiceDetailsReducer,
    invoiceCircuitId:InvoiceDetailsItemIDReducer,
    uniqueIdReducer:UniqueItemIDReducer,
    InvetoryDetailsPopup:InvoiceInventoryDetailsPopupReducer,
    SideBarStatus:SideBarToggleStatus
})

export default rootReducer