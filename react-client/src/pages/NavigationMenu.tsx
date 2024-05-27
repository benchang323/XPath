// NavigationMenu.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@nextui-org/react';
import side_pic_1 from '../assets/pictures/Side_bar_1.png'
import side_pic_2 from '../assets/pictures/Side_bar_2.png'
import dummy_avatar from '../assets/pictures/dummy_avatar_pic_1.png'
import chat_pic from '../assets/pictures/chat_pic.png'
import preferences_pic from '../assets/pictures/image0.png';
import trips_pic from '../assets/pictures/image1.png';
import trips_bucket from '../assets/pictures/trips_bucket.png'
import match_pic from '../assets/pictures/image2.png';
import {  useDispatch } from 'react-redux';
import { setUserEmailRedux } from '../redux/userActions.ts';

// import {
//   Chat,
//   Channel,
//   Window,
//   ChannelHeader,
//   MessageList,
//   MessageInput,
//   ChannelList,
//   useChatContext,
// } from 'stream-chat-react';
// import 'stream-chat-react/dist/css/index.css';


const NavigationMenu: React.FC = () => {
  const bearerToken = sessionStorage.getItem("bearerToken");
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState<string>("");
  const [avatarPicUrl, setAvatarPicUrl] = useState<string | null>(null);
  // const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  //   useEffect(() => {
  //     const initChat = async () => {

  //         const API_URL = import.meta.env.VITE_API_URL;
  //         let apiKey = import.meta.env.STREAM_API_KEY;
  //         const bearerToken = sessionStorage.getItem("bearerToken");
  //         const response = await fetch(`${API_URL}/chat/user`, {
  //             method: "GET",
  //             headers: {
  //               // Include bearer token in the request headers
  //               Authorization: `Bearer ${bearerToken}`,
  //             },
  //           });
  //         const config = await response.json();
  //         const userToken = config.streamChatToken;
  //         const userId = config.profileId.toString();
  //         console.log(userToken)
  //         apiKey = "rxuvyjpj3ypg"


  //         const client = StreamChat.getInstance(apiKey);
  //         await client.connectUser(
  //           {
  //             id: userId,
  //             name: config.name, // Adjust according to your user object
  //             image: avatarPicUrl, // Adjust according to your user object
  //           },
  //           userToken,
  //         );

  //         setChatClient(client);
  //     };

  //     if (!chatClient) {
  //         initChat();
  //     }

  //     return () => {
  //         if (chatClient) {
  //             chatClient.disconnectUser().then(() => setChatClient(null));
  //         }
  //     };
  // }, [chatClient]);

  // const profilePictureUrl = "https://via.placeholder.com/150";

  useEffect(() => {
    // Fetch user's username when component mounts
    fetchUsername();
  }, []);

  const fetchUsername = async () => {
    try {
      const userResponse = await fetch(`${API_URL}/matching/profile`, {
        method: 'GET',
        headers: {
          // Include bearer token in the request headers
          Authorization: `Bearer ${bearerToken}`,
        },
      });
      if (userResponse.ok) {
        const data = await userResponse.json();
        setUsername(data.profile.full_name); // Assuming the full name is the username
      } else {
        console.error('Failed to fetch username:', userResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching username:', error);
    }
  };

  useEffect(() => {
    // Fetch user's profile picture when component mounts
    handleAvatarPic();
  }, []);

  const handleAvatarPic = async () => {
    try {
      const response = await fetch(`${API_URL}/matching/profile/avatarPicUrl`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const avatarPicUrl = data.url; // Assuming the response contains the avatar URL
        // console.log(data.url);
        setAvatarPicUrl(avatarPicUrl);
        sessionStorage.setItem("avatarPicUrl", avatarPicUrl);
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch(`${API_URL}/user_account/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include the bearer token if available
          Authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.ok) {
        // Clear session storage
        sessionStorage.removeItem('bearerToken');
        localStorage.removeItem("bearerToken");
        console.log('User signed out');
        dispatch(setUserEmailRedux('')); // Set user's email to empty string

        // Redirect to home page
        navigate('/');
      } else {
        console.error('Failed to log out:', response.statusText);
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between py-4 bg-black px-7">
        <a href="/" className="text-xl font-bold">
          xPath
        </a>
        <div>
          <Button
            onPress={handleSignOut}
            color={"white" as any}
            size={"small" as any}
            variant="ghost"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content container */}
      <div className="flex flex-grow">
        {/* Left side image */}
        <div className="flex-1">
          <img
            src={side_pic_1}
            alt="Side Decor"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Main navigation menu */}
        <div className="flex flex-col items-center justify-start flex-grow">
          <div className="flex flex-col items-center mt-10">
            {/* Conditionally render avatar picture or dummy avatar */}
            {avatarPicUrl ? (
              <img
                src={avatarPicUrl}
                alt="Avatar"
                className="w-32 h-32 border-4 border-gray-500 rounded-full"
              />
            ) : (
              <img
                src={dummy_avatar}
                alt="Avatar"
                className="w-32 h-32 border-4 border-gray-500 rounded-full"
              />
            )}
            <h2 className="mt-6 font-sans text-2xl">
              Good to see you, {username}
            </h2>

          </div>
          <div className="flex mt-8">

            {/* Square picture 1 with added margin */}
            <div className="flex flex-col items-center mx-4 mb-4">
              <img src={match_pic} alt="Match pic" className="w-24 h-24 mb-4" /> {/* Added margin below image */}
              <div>
                <Button
                  radius="md"
                  variant="flat"
                  className="text-white shadow-lg bg-gradient-to-tr from-pink-500 to-yellow-500"
                  onPress={() => navigate('/matching')}
                >
                  Matching
                </Button>
              </div>
            </div>
            {/* Square picture 2 with added margin */}
            <div className="flex flex-col items-center mx-4 mb-4">
              <img src={trips_pic} alt="Trip pic" className="w-24 h-24 mb-4" /> {/* Added margin below image */}
              <div>
                <Button
                  radius="md"
                  variant="flat"
                  className="text-white rounded-lg shadow-lg bg-gradient-to-tr from-blue-500 to-purple-500"
                  onPress={() => navigate('/mappage')}
                >
                  Trips
                </Button>
              </div>
            </div>
            {/* Square picture 3 with added margin */}
            <div className="flex flex-col items-center mx-4 mb-4">
              <img src={preferences_pic} alt="Preference pic" className="w-24 h-24 mb-4" /> {/* Added margin below image */}
              <div>
                <Button
                  radius="md"
                  variant="flat"
                  color="warning"
                  className="text-white rounded-lg shadow-lg bg-gradient-to-tr from-pink-500 to-blue-500"

                  onPress={() => navigate('/preferences')}
                >
                  Preferences
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-center mx-4 mb-4">
              <img src={chat_pic} alt="Preference pic" className="w-24 h-24 mb-4" /> {/* Added margin below image */}
              <div>
                <Button
                  radius="md"
                  variant="flat"
                  color="warning"
                  className="text-white rounded-lg shadow-lg bg-gradient-to-tr from-pink-500 to-blue-500"

                  onPress={() => navigate('/chat')}
                >
                  Chat
                </Button>
              </div>
            </div>
            {/* Square picture 5 with added margin */}
            <div className="flex flex-col items-center mx-4 mb-4">
              <img src={trips_bucket} alt="Trips bucket pic" className="w-24 h-24 mb-4" /> {/* Added margin below image */}
              <div>
                <Button
                  radius="md"
                  variant="flat"
                  className="text-white rounded-lg shadow-lg bg-gradient-to-tr from-blue-500 to-purple-500"
                  onPress={() => navigate('/trips-bucket')}
                >
                  Bucket List
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Right side image */}
        <div className="flex-1">
          <img
            src={side_pic_2}
            alt="Side Decor"
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-white bg-gray-800">
        {/* Footer content */}© 2024 xPath. All rights reserved.
      </div>
    </div>
  );
};

export default NavigationMenu;
