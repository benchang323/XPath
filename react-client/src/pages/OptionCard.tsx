
import React, { useState, useEffect} from 'react';

import { TrashIcon} from '@radix-ui/react-icons'

interface OptionCardProps {
  image_url: string;
  trip_id: number; // Added to uniquely identify each trip
  name: string;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}

//the option card has 5 elements, image url, trip id, name, flag to check if active, 
// onclick to trigger set active, like and finally ondelete to delete

const OptionCard: React.FC<OptionCardProps> = ({ image_url, name, active, onClick, onDelete }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const grant_type = import.meta.env.VITE_grant_type;
  const client_id = import.meta.env.VITE_client_id;
  const client_secret = import.meta.env.VITE_client_secret;

  const [liked, setLiked] = useState(false);
  const activeClass = active ? 'active' : '';
  const optionStyle = { '--optionBackground': `url(${image_url})` } as React.CSSProperties;

  const bearerToken = sessionStorage.getItem("bearerToken");


  //we use check liked status to check if a given name, is liked or not
  useEffect(() => {
    const checkLikedStatus = async () => {
        if (!bearerToken) {
            console.error("Bearer token is not available.");
            return;
        }
        try {
            const response = await fetch(`${API_URL}/trips_likes/trip/${encodeURIComponent(name)}/isLiked/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${bearerToken}`,
                    'Content-Type': 'application/json',
                },
            });
  
            if (response.ok) {
                const data = await response.json();
                setLiked(data.isLiked);
            } else {
                const errorText = await response.text();
                console.error(`Failed to fetch liked status for ${name}: ${response.statusText}`, errorText);
            }
        } catch (error) {
            console.error(`Error fetching liked status for ${name}:`, error);
        }
    };

    checkLikedStatus();
}, [name, bearerToken]); 




  const handleDeleteClick = (e: any) => {
    e.stopPropagation(); // Stop event bubbling to prevent onClick from triggering
    onDelete(); // Call the onDelete function passed as a prop
  };

  const generateRecommendations = async () => {
    
    try{

    // Step 1: Get Access Token
    const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'grant_type': grant_type,
        'client_id': client_id,
        'client_secret': client_secret
      })
    });
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      console.error('Access token could not be retrieved');
      return;
    }

    // Step 2: Fetch IATA Code
    const iataResponse = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations/cities?keyword=${name}&max=1`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const iataData = await iataResponse.json();
    const iataCode = iataData.data?.[0]?.iataCode;
    if (!iataCode) {
      console.error('IATA code could not be retrieved');
      return;
    }


    // Step 3: Get Recommendations
    const recommendationsResponse = await fetch(`https://test.api.amadeus.com/v1/reference-data/recommended-locations?cityCodes=${iataCode}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const recommendationsData = await recommendationsResponse.json();
    // console.log(recommendationsData)
    console.log(recommendationsData.data.map((city: any) => city.name)); // Log the recommended cities' names
    if (recommendationsData && recommendationsData.data) {
      const cityNames = recommendationsData.data.map((city: any) => city.name);
      console.log(cityNames);
      return cityNames;
    }
    return [];
    } catch (error) {
      console.error('Error making the request:', error);
      return [];
    }


  }

  const saveRecommendations = async (cityNames: any) => {
    try {
      const response = await fetch(`${API_URL}/trips_likes/recommendations/add/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recommendations: cityNames })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save recommendations: ${errorText}`);
      }
      console.log("Recommendations saved successfully.");




      // Now fetch the top 5 most liked locations
      const topRecommendationsResponse = await fetch(`${API_URL}/trips_likes/recommendations/`, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!topRecommendationsResponse.ok) {
        const errorText = await topRecommendationsResponse.text();
        throw new Error(`Failed to retrieve top recommendations: ${errorText}`);
      }

      const topRecommendationsData = await topRecommendationsResponse.json();
      console.log("Top 5 most liked locations:", topRecommendationsData);




    } catch (error) {
      console.error('Error saving recommendations:', error);
    }
  };


  const handleLikeClick = async (e: any) => {
    e.stopPropagation();  // Prevent the default action to ensure form isn't submitted
    const action = liked ? 'unlike' : 'like'; 
    try {
        const response = await fetch(`${API_URL}/trips_likes/trip/${encodeURIComponent(name)}/?action=${action}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            // Toggle liked state immediately upon success
            setLiked(!liked);

            // Fetch and log similarity data
            const simResponse = await fetch(`${API_URL}/trips_likes/similarity/`, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${bearerToken}`,
                  'Content-Type': 'application/json',
              },
            });
            if (simResponse.ok) {
                const simData = await simResponse.json();
                console.log('Similarity data:', simData);
            }

        } else {
            const errorText = await response.text();
            console.error(`Error performing like/unlike action: ${response.statusText}`, errorText);
        }

        if(!liked)
          {
            const recommendations = await generateRecommendations();
            console.log('recommendations:',recommendations)
            if (recommendations.length > 0) {
              await saveRecommendations(recommendations);
            }
          }
        
       else {
          const errorText = await response.text();
          console.error(`Error performing like/unlike action: ${response.statusText}`, errorText);
      }

    } catch (error) {
        console.error('Error making the request:', error);
    }
};


  return (
    <div className={`option ${activeClass}`} style={optionStyle} onClick={onClick}>
      <div className="shadow"></div>
      <div className="label">
        <div className="icon" onClick={handleLikeClick} style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '36px', color: liked ? 'red' : 'grey' }}>&#x2665;</span> 
        </div>
        <div className="delete-btn" onClick={handleDeleteClick} style={{ cursor: 'pointer' }} data-testid="delete-button">
          <TrashIcon width="36" height="36" style={{color: 'red' }}/>
        </div>
        <div className="info">
          <div className="main">{name}</div>
        </div>

      </div>
    </div>
  );
};

export default OptionCard;