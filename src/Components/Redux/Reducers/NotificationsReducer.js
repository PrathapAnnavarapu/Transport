const saveState = (state) => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('notificationsState', serializedState);
    } catch (error) {
      // console.error("Could not save state", error);
    }
  };

  
const loadState = () => {
    try {
      const serializedState = localStorage.getItem('notificationsState');
      if (serializedState === null) {
        return undefined;
      }
      return JSON.parse(serializedState);
    } catch (error) {
      // console.error("Could not load state", error);
      return undefined;
    }
  };



const persistedNotifications = loadState() || [];


export default function NotificationReducer(state=persistedNotifications, action){
    const { type, payload } = action

    switch (type) {
        case 'addNotification':
            const newState =  [...state, payload]
            saveState(newState);  
            return newState  
        case 'removeNotification':
            const updatedState = state.filter(notification => notification.invoiceNumber !== payload);
            saveState(updatedState);
            return updatedState;  
        case 'closeNotification': 
             saveState([]);
             return [];
        default:
            return state;
    }

}