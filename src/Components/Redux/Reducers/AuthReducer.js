import Cookies from 'js-cookie'



const token = Cookies.get('jwt_token');
 
const isAuthenticated = token !== undefined ? true : false;

export default function AuthReducer(state = isAuthenticated, action) {
  const { type } = action;

  switch (type) {
    case 'LOGIN_SUCCESS':
      return true; // Set isAuthenticated to true upon successful login
    case 'LOGOUT':
    case 'LOGIN_FAILURE':
      return false; // Set isAuthenticated to false upon logout or login failure
    default:
      return state;
  }
}