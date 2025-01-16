import {combineReducers} from 'redux'
import ActiveAccount from './Reducers/ActiveAccountNumber'

const rootReducer = combineReducers({
    Account:ActiveAccount,
})

export default rootReducer