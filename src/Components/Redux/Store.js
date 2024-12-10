

import {createStore, applyMiddleware} from 'redux'
import {thunk} from 'redux-thunk'

import rootReducer from './Reducer'

const middleware = [thunk]


const Store = createStore(rootReducer, applyMiddleware(...middleware))

export default Store