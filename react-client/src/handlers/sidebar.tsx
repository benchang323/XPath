//Sidebar
import React, { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { FaUserFriends, FaSuitcaseRolling } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { FaHandshake } from "react-icons/fa";
import {Divider} from "@nextui-org/react";




const Sidebar: React.FC = () => {
  const bearerToken = sessionStorage.getItem("bearerToken");
  const API_URL = import.meta.env.VITE_API_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [avatarPicUrl, setAvatarPicUrl] = useState<string | null>(null);

  // Logic to populate user's info and sign out
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
        console.log(data);
        setAvatarPicUrl(avatarPicUrl);
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div
      className={`flex flex-col h-screen p-3 transition-width duration-300 ease-in-out ${isSidebarOpen ? "w-60" : "w-0 overflow-hidden"
        } relative`}
      style={{
        background: `linear-gradient(to bottom right, #4b6cb7, #f472b6)`
      }}
    >
      <button
        className={`absolute top-3 ${isSidebarOpen ? 'right-3' : 'left-0'} p-1 z-50 ${isSidebarOpen ? '' : 'flex items-left justify-left'}`}
        onClick={toggleSidebar}
      >
        {/* Collapsible Icon */}
        {isSidebarOpen ? (
          // Icon when sidebar is open (X icon or similar)
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Icon when sidebar is closed (Menu icon)
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-6 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        )}
      </button>


      {isSidebarOpen && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white">Navigation</h2>
          </div>

          {/* Search Box */}
          <div className="relative mb-6">
            <Input
              type="search"
              name="Search"
              placeholder="Search..."
              className="w-full py-2 pl-0 pr-0 text-white bg-transparent border-none rounded-md focus:outline-none"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex-1 space-y-2">
            {/* Adjusted for right icon alignment */}
            <Button
              color="default"
              variant="flat"
              className="justify-between w-full text-white"
              onClick={() => {/* Handle Trips button click */ }}
            >
              <FaSuitcaseRolling className="text-xl" /> Trips
            </Button>

            <Button
              color="default"
              variant="flat"
              className="justify-between w-full text-white"
              onClick={() => navigate('/chat')}
            >
              <FaUserFriends className="text-xl" /> Chat
            </Button>

            <Divider className="my-4" />
            <Collapsible>
            <CollapsibleTrigger className="flex items-center w-full mb-4 text-right text-white">
    <FaHandshake className="ml-4 mr-2 text-xl" /> {/* Adjust the size using text-xl class */}
    <span className="flex-grow mr-3 text-sm font-bold">Matching</span>
</CollapsibleTrigger>


              <CollapsibleContent>
                <Button
                  color="default"
                  variant="ghost"
                  className="w-full mb-4 text-right text-white"
                  onPress={() => navigate('/matching')}
                >
                  Find Potential Matches
                </Button>

                <Button
                  color="default"
                  variant="ghost"
                  className="w-full mb-4 text-right text-white"
                  onPress={() => navigate('/matchingRequest')}
                >
                  Match Requests
                </Button>
                <Button
                  color="default"
                  variant="ghost"
                  className="w-full mb-4 text-right text-white"
                  onPress={() => navigate('/existingMatch')}
                >
                  View Existing Matches
                </Button>
              </CollapsibleContent>
            </Collapsible>

          </div>


         {/* Profile Section */}
          <div className="absolute bottom-0 left-0 flex items-center w-full p-2 mt-auto space-x-4">
            <img src={avatarPicUrl || ""} alt="User Avatar" className="w-12 h-12 rounded-lg" />
            <div className="w-full">
              <h2 className="font-sans text-lg text-white break-all">{username}</h2>
              <span className="flex items-center space-x-1">
                <a href="#" className="text-xs text-white hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/preferences');
                  }}>
                  View profile
                </a>
              </span>
            </div>
          </div>

        </>
      )}
    </div>
  );
};

export default Sidebar;

