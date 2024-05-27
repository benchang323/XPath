
//App.tsx
//import HelloWorldComponent from "./components/ui/HelloWorld";
//import EmailVerification from "./components/ui/EmailVerification";
//import ProfileForm from "./components/ui/ProfileForm.tsx";

import React, { useState, useEffect }  from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";
import Home from "./pages/HomePage";
import MyComponent from "./handlers/GoogleMaps/commutes";
import NavigationMenu from "./pages/NavigationMenu";
import ProfileCreation from "./pages/CreateProfile.tsx";
import Matching from "./pages/MatchingPage";
import NavMenu from "./pages/Dashboard";
import OptionsContainer from "./pages/OptionsContainer";
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from "./redux/store";
import MapPage from "./pages/MapPage";
// import ChatPage from "./pages/ChatPage";
// import Chat from "./pages/Chat";
import IncomingMatch from "./pages/MatchingRequest";
import UserProfile from "./pages/UserProfile.tsx";
import ExistingMatch from "./pages/ExistingMatch.tsx";
import { useSelector, useDispatch } from 'react-redux';
import ChatPage from "./pages/ChatPage.tsx";
// Define RootState interface representing the structure of your Redux store
interface RootState {
  user: UserState; // Assuming UserState is the type of your 'user' slice
}

interface UserState {
  // Define the properties of the 'user' slice
  userEmail: string;
}

function App() {

  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const bearerToken = sessionStorage.getItem("bearerToken");

  // useEffect(() => {
  //   // Check if auth token exists in session storage
  //   const bearerToken = sessionStorage.getItem("bearerToken");
  //   if (bearerToken) {
  //     setIsLoggedIn(true);
  //   } else {
  //     setIsLoggedIn(false);
  //   }
  // }, [bearerToken]); // Include bearerToken as a dependency
  

  // // Protected route component to prevent access when not logged in
  // const ProtectedRoute = ({ element, ...rest }) => {
  //   console.log(isLoggedIn);
  //   return isLoggedIn ? element : <Navigate to="/" replace />;
  // };

  return (
    <Provider store={store}>
      <NextUIProvider>
        <Router>
          {/* Wrap your routes with Router */}
          <div>
            <Routes>
              {/* Public routes accessible to all users */}
              <Route path="/" element={<Home />} />

              {/* Protected routes accessible only when logged in */}
              <Route path="/createProfile" element={<ProtectedRoute element={<ProfileCreation />} />} />
              <Route path="/navigationMenu" element={<ProtectedRoute element={<NavigationMenu />} />} />
              <Route path="/mappage" element={<ProtectedRoute element={<MapPage />} />} />
              <Route path="/trips-bucket" element={<ProtectedRoute element={<OptionsContainer />} />} />
              <Route path="/maps" element={<ProtectedRoute element={<MyComponent />} />} />
              <Route path="/maps" element={<ProtectedRoute element={<MyComponent />} />} />
               <Route path="/maps" element={<ProtectedRoute element={<MyComponent />} />} />
              <Route path="/matching" element={<ProtectedRoute element={<Matching />} />} />
              <Route path="/matchingRequest" element={<ProtectedRoute element={<IncomingMatch />} />} />
              <Route path="/existingMatch" element={<ProtectedRoute element={<ExistingMatch />} />} />
              <Route path="/preferences" element={<ProtectedRoute element={<UserProfile />} />} />
              <Route path="/chat" element={<ProtectedRoute element={<ChatPage />} />} />

              {/* Unprotected */}
              {/* <Route path="/" element={<Home />} />
              <Route path="/navigationMenu" element={<NavigationMenu />} />
              <Route path="/mappage" element={<MapPage />} />
              <Route path="/trips-bucket" element={<OptionsContainer />} />
              <Route path="/maps" element={<MyComponent />} />
              <Route path="/matching" element={<Matching />} />
              <Route path="/matchingRequest" element={<IncomingMatch />} />
              <Route path="/existingMatch" element={<ExistingMatch />} />
              <Route path="/createProfile" element={<ProfileCreation />} />
              <Route path="/preferences" element={<UserProfile />} />

              <Route path="/trips" element={<MyComponent />} />
              <Route path="/chat" element= {<ChatPage /> } />  */}
              {/* <Route path="/dashboard" element= {<NavMenu />} /> */}
              
            </Routes>
          </div>
        </Router>
      </NextUIProvider>
    </Provider>
  );
}

// Protected route component to prevent access when not logged in
const ProtectedRoute = ({ element, ...rest }) => {
  const user = useSelector(state => state.user);
  const isLoggedIn = user.userEmail ? true : false;
  return isLoggedIn ? element : <Navigate to="/" replace />;
};

export default App;
