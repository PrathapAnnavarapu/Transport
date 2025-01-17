const initialState = {
    accountNumber: null,
  };
  
  const accountReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'Add_account_number':
        return {
          ...state,
          accountNumber: action.payload,
        };
      case 'Clear_account_number':
        return {
          ...state,
          accountNumber: null,
        };
      default:
        return state;
    }
  };
  
  export default accountReducer;