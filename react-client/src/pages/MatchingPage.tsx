// Matching.tsx 
import React, { useState, useEffect } from 'react';
import Sidebar from '@/handlers/sidebar';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardFooter, Divider, Image } from '@nextui-org/react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useSelector, useDispatch } from 'react-redux';
import { setUserEmailRedux } from '../redux/userActions.ts';
import { CircularProgress, Badge } from "@nextui-org/react";
import dummy_avatar from '../assets/pictures/dummy_avatar_pic_1.png';


interface RootState {
  user: UserState; // Assuming UserState is the type of your 'user' slice
}

interface UserState {
  // Define the properties of the 'user' slice
  userEmail: string;
}

const placeholderCards = [
  {
    id: 1,
    name: 'Jane Doe',
    location: 'Baltimore, Maryland',
    bio: 'Bio or other details can go here.',
    imageUrl: 'https://source.unsplash.com/random/300x300?face'
  },
  {
    id: 2,
    name: 'John Smith',
    location: 'New York, NY',
    bio: 'Another bio or details here.',
    imageUrl: 'https://source.unsplash.com/random/301x300?face'
  },
  // Add more cards as needed
];

const Matching: React.FC = () => {
  const bearerToken = sessionStorage.getItem("bearerToken");
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const { userEmail } = user; // Access the userEmail from the Redux state
  const [username, setUsername] = useState<string>("");
  const [profile, setProfile] = useState<any[]>([]);
  const [userId, setUserId] = useState<string>("");
  // const [existingMatch, setExistingMatch] = useState<any[]>([]);
  // const [inProgressMatch, setInProgressMatch] = useState<any[]>([]);
  // const [notMatch, setNotMatch] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [similarityScore, setSimilarityScore] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const currentCard = recommendations[currentCardIndex]?.profile;
  const currentScore = recommendations[currentCardIndex]?.similarity_score;
  const currentAvatar = recommendations[currentCardIndex]?.avatar;


  // Fetch profiles for matching
  useEffect(() => {
    fetchProfilesForMatching();
  }, []);

  const fetchProfilesForMatching = async () => {
    try {
      // const response = await fetch(`${API_URL}/matching/profile/matches`, {
      const response = await fetch(`${API_URL}/matching/profile/recommendations`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${bearerToken}`, // Add the bearer token for authentication
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
        // console.log(data.avatar);
        // setExistingMatch(data.matches);
        // setInProgressMatch(data.in_progress_matches);
        // setNotMatch(data.not_matches);
        // console.log(data.in_progress_matches);
        // console.log(data.not_matches);

      } else {
        console.error('Failed to fetch profiles for matching');
      }
    } catch (error) {
      console.error('Error fetching profiles for matching:', error);
    }
  };

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
        setProfile(data.profile);
        setUserId(data.profile.user);

        // console.log(data.profile.full_name);
        // console.log(data.profile.user);
      } else {
        console.error('Failed to fetch username:', userResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching username:', error);
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

  const handleAddMatch = async () => {
    try {
      // const fromUserId = userId;
      const toUserId = currentCard.user;

      // console.log("from_id", fromUserId);
      // console.log("to_id", toUserId);

      // Send a POST request to add the match
      const response = await fetch(`${API_URL}/matching/profile/matches`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_user_id: toUserId,
        }),
      });

      if (response.ok) {
        // console.log('Profile request success');
      } else {
        console.error('Failed to add match');
      }
    } catch (error) {
      console.error('Error adding match:', error);
    }

    // Move to the next card if available
    if (currentCardIndex < recommendations.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handleRejectMatch = async () => {
    try {
      // const fromUserId = userId;
      const toUserId = currentCard.user;

      // console.log("from_id", fromUserId);
      // console.log("to_id", toUserId);

      // Send a DELETE request to add the match
      const response = await fetch(`${API_URL}/matching/profile/matches`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to_user_id: toUserId,
        }),
      });

      if (response.ok) {
        console.log('Profile rejected successfully');
      } else {
        console.error('Failed to add match');
      }
    } catch (error) {
      console.error('Error adding match:', error);
    }

    // Move to the next card if available
    if (currentCardIndex < recommendations.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between py-4 bg-black px-7">
        <a href="/" className="text-xl font-bold">xPath</a>
        <div>
          <Button onPress={handleSignOut} color="white" size="small" variant="ghost">Sign Out</Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-grow">
        <Sidebar />

        <div className="flex flex-col items-center justify-center flex-grow p-4">
          {/* Main Card for profile matching; render for each recommendation */}
          <Card style={{ width: '500px', height: '400px' }} className="flex-row items-center p-0">
            {/* Conditionally render CircularProgress while recommendations are loading */}
            {recommendations.length === 0 && (
              <div className="flex items-center justify-center w-full h-full">
                <CircularProgress
                        color="default"
                        aria-label="Loading..."
                      />
              </div>
            )}
            {/* Conditionally render card content when recommendations are available */}
            {recommendations.length > 0 && (
              <div className="flex items-center">
                {/* Profile image */}
                <Badge content={`${(currentScore * 100).toFixed(1)}%`} size="lg" color="primary" >


                <Image
                  src={currentAvatar || dummy_avatar}
                  alt="avatar"
                  width="200px"
                  height="200px"
                  className="pl-6"
                />
                 </Badge>
                {/* Profile details */}
                <div className="flex flex-col justify-center py-4 pl-4">
                  <p className="m-0 font-bold">{currentCard.full_name}</p>
                  <p>Country: {currentCard.country}</p>
                  <p>State: {currentCard.state}</p>
                  <p>Occupation: {currentCard.occupation}</p>
                  <p>Gender: {currentCard.gender}</p>
                </div>
              </div>
            )}
          </Card>


          {/* Action buttons */}
          {recommendations.length > 0 && currentCard && (
            <div className="flex mt-4">
              <Button onClick={handleAddMatch} className="mr-2 text-white shadow-lg bg-gradient-to-tr from-pink-500 to-yellow-500">Accept</Button>
              <Button onClick={handleRejectMatch} color="secondary">Reject</Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center bg-gray-800">
        © 2024 xPath. All rights reserved.
      </div>
    </div>
  );
}
export default Matching;
