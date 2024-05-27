// reducers/index.js

import { combineReducers } from 'redux';
import userReducer from './userReducers.js';

const rootReducer = combineReducers({
  user: userReducer,
});

export default rootReducer;
