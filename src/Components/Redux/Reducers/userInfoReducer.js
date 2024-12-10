
const saveUserState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('userInfoState', serializedState);
  } catch (error) {
    // console.error("Could not save state", error);
  }
};


const loadUserState = () => {
  try {
    const serializedState = localStorage.getItem('userInfoState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    // console.error("Could not load state", error);
    return undefined;
  }
};


const initialState = loadUserState() || null

export default function userInfo(state = initialState, action) {
    const { type, payload } = action;
  
    switch (type) {
      case 'LOGIN_SUCCESS_Payload':
        saveUserState(payload);  
        return payload;
      case 'LOGOUT_Payload':
        saveUserState(null);
        return null; 
      default:
        return state;
    }
  }