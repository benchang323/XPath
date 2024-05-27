import React, { useState, useEffect } from 'react';
import { apiURL } from '../config';
interface Profile {
  id: string;
  interests: string[];
  gender: string;
  job: string;
  bio: string;
  industry: string;
  languages: string[];
  ethnicity: string;
  hometown: string;
  currentCity: string;
}

interface UserProfileProps {
  profile: Profile;
  onMatch: () => void;
  onReject: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ profile, onMatch, onReject }) => {
  return (
    <div className="max-w-md p-4 mx-auto overflow-hidden bg-white shadow-md rounded-xl md:max-w-2xl">
      <div className="md:flex">
        <div className="p-8">
          <div className="text-sm font-semibold tracking-wide text-indigo-500 uppercase">Profile</div>
          <p className="block mt-1 text-lg font-medium leading-tight text-black">Interests: {profile.interests.join(', ')}</p>
          <p className="mt-2 text-lg font-medium leading-tight text-gray-800">Bio: {profile.bio}</p>
          <p className="mt-2 text-gray-500">Gender: {profile.gender}</p>
          <p className="mt-2 text-gray-500">Job: {profile.job}</p>
          <p className="mt-2 text-gray-500">Industry: {profile.industry}</p>
          <p className="mt-2 text-gray-500">Languages: {profile.languages.join(', ')}</p>
          <p className="mt-2 text-gray-500">Ethnicity: {profile.ethnicity}</p>
          <p className="mt-2 text-gray-500">Hometown: {profile.hometown}</p>
          <p className="mt-2 text-gray-500">Current City: {profile.currentCity}</p>
          <div className="flex justify-center mt-4">
            <button
              className="px-4 py-2 mr-2 font-bold text-white bg-green-500 rounded hover:bg-green-700"
              onClick={onMatch}
            >
              Match
            </button>
            <button
              className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
              onClick={onReject}
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilesManager: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const fetchProfiles = async () => {
      const authToken = sessionStorage.getItem('bearerToken'); // Or however you store your token
      try {
        const response = await fetch(`${apiURL}/matching/profiles`, { // Ensure this URL is correct
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setProfiles(data.matches); // Adjust according to the actual structure of your response
        } else {
          console.error('Failed to fetch profiles');
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };

    fetchProfiles();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleMatch = () => {
    // Logic for match action
    console.log("Matched");
  };

  const handleReject = async () => {
    apiURL = process.env.REACT_APP_API_BASE_URL;
    const matchId = profiles[currentIndex].id; // Assuming each profile has a unique identifier you can use as `matchId`
  
    try {
      const response = await fetch(`${apiURL}/api/matches/${matchId}/delete/`, {
        method: 'POST', // Assuming method is POST, adjust if necessary
      });
      if (!response.ok) throw new Error('Failed to delete match');
      // remove the profile from the list and update state
      const updatedProfiles = profiles.filter((_, index) => index !== currentIndex);
      setProfiles(updatedProfiles);
      setCurrentIndex(currentIndex + 1); 
    } catch (error) {
      console.error('Error deleting match:', error);
    }
  };
  
  

  return (
    <div>
      {profiles.length >= 0 ? (
        <UserProfile 
          profile={profiles[currentIndex]} 
          onMatch={handleMatch} 
          onReject={handleReject}
        />
      ) : (
        <p>No profiles available.</p>
      )}
    </div>
  );
};

export {UserProfile};
export default ProfilesManager;
