const initialState = '' || null;

export default function AuthReducer(state = initialState, action) {
  const { type, value } = action;

  switch (type) {
    case 'Add_account_number':
      return state = value;
    case 'remove_account_number':
      return ''; // Set state to an empty string upon logout or login failure
    default:
      return state;
  }
}