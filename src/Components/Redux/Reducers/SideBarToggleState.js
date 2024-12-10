const toggleSideBar = false 

export default function SideBarToggleStatus(state = toggleSideBar, action) {
    const { type } = action;
  
    switch (type) {
      case 'minimize_the_side_bar':
        return  true; // Set isAuthenticated to true upon successful login
      case 'LOGOUT':
      case 'maximize_the_side_bar':
        return toggleSideBar; // Set isAuthenticated to false upon logout or login failure
      default:
        return state;
    }
  }