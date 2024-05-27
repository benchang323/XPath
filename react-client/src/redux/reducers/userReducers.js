// reducers/userReducer.js

const initialState = {
    userEmail: '',
  };
  
  const userReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_USEREMAIL':
        return {
          ...state,
          userEmail: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default userReducer;
  