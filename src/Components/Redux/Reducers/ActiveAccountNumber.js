



const account = ''
 
export default function AuthReducer(state = account, action) {
  const { type, value } = action;

  switch (type) {
    case 'Add_account_number':
      return state = value;     
    case 'remove_account_number':
      return state = ''; // Set isAuthenticated to false upon logout or login failure
    default:
      return state;
  }
}