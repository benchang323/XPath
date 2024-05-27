import React, { useState, useEffect, useRef } from 'react';
import OptionCard from './OptionCard';
import './OptionCard.css';
import { useNavigate } from 'react-router-dom';
import { useLoadScript } from "@react-google-maps/api";


const libraries: any = ["places"]; //from the google maps api, we want the google places library

interface Destination {
  name: string;
  image_url: string;
}
const OptionsContainer: React.FC = () => {
  const bearerToken = sessionStorage.getItem("bearerToken");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  console.log(offsetY)
  const [DestinationsData, setDestinationsData] = useState<Destination[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;

  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const unsplashClientID = import.meta.env.VITE_unsplashClientID;
  const navigate = useNavigate();
  const autocompleteRef = useRef(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [activeTab, setActiveTab] = useState('custom'); 
  const [topRecommendations, setTopRecommendations] = useState([]);


  const { isLoaded} = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY, 

    libraries,
  });

  const navigateToNavigationMenu = () => {
    navigate('/navigationMenu'); // Navigate to the navigation menu page
  };


// when the page renders use effect defines and calls the fetchdestinations function, 
// which fetches destinations from the server side or database, 
// then it populates the destinationsdata variable using the setDestinationsData like we defined in usestate
// it also handles errors, [] indicates that when the page initially renders, fetchdest is called once
// there is also a function to handle scroll, and it is unmounted as well

  useEffect(() => {
    if (activeTab === 'recommendations') {
      fetchTopRecommendations();
    }
  }, [activeTab]);

  const fetchTopRecommendations = async () => {
    try {
      const response = await fetch(`${API_URL}/trips_likes/recommendations/`, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to retrieve top recommendations: ${errorText}`);
      }
  
      const recommendationsData = await response.json();
      await loadRecommendationsImages(recommendationsData);
    } catch (error) {
      console.error('Error fetching top recommendations:', error);
    }
  };

  const loadRecommendationsImages = async (recommendations: any) => {
    const recommendationsWithImages = await Promise.all(recommendations.map(async (rec: any) => {
      const unsplashResponse = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${encodeURIComponent(rec.city_name)}&client_id=${unsplashClientID}&orientation=landscape`, {
        method: 'GET',
      });
  
      if (!unsplashResponse.ok) {
        throw new Error('Failed to fetch image from Unsplash');
      }
  
      const imageData = await unsplashResponse.json();
      const imageUrl = imageData.results[0]?.urls.full || 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Use a default image if none is found
  
      return {
        ...rec,
        image_url: imageUrl,
      };
    }));
  
    setTopRecommendations(recommendationsWithImages as any);
  };
  

  useEffect(() => {

    const fetchDestinations = async () => {
      try {

        const response = await fetch(`${API_URL}/trips_likes/destination/`, {
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        console.log(data)
        setDestinationsData(data);
      } catch (error) {
        console.error("Error fetching Destinations: ", error);
      }
    };

    fetchDestinations();

    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
  
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // this is another useffect function, 
  // This effect runs initially and then only reruns when the values of isLoaded or autocomplete change. 
  // isLoaded might be a state variable indicating that some resources have loaded, 
  // and autocomplete could be a state variable managing the state of the autocomplete functionality.

  useEffect(() => {
    if (isLoaded && !autocomplete && autocompleteRef.current) {
      let autoCompleteInit = null as any
      autoCompleteInit = new window.google.maps.places.Autocomplete(
        autocompleteRef.current,
        { types: ["(cities)"], fields: ["place_id", "name", "geometry"] }
      );
      autoCompleteInit.addListener("place_changed", () => {
        const place = autoCompleteInit.getPlace() as any;
        setSearchTerm(place.name); // Set the input field text to the selected place name
      });
      setAutocomplete(autoCompleteInit);
    }
  }, [isLoaded, autocomplete]);





  //with handle add destinations, we try to add a new destination, by using the name, trip id and image url
  //Destinationsdata holds the list of all current destinations, we add an entry to this
  const handleAddDestination = async (e: any) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (!searchTerm) return; // Prevent adding empty names

    try {

      const unsplashResponse = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${encodeURIComponent(searchTerm)}&client_id=${unsplashClientID}&orientation=landscape`, {
      method: 'GET',
      });
      if (!unsplashResponse.ok) {
        throw new Error('Failed to fetch image from Unsplash');
      }
      const imageData = await unsplashResponse.json();
      const imageUrl = imageData.results[0]?.urls.full || 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Use a default image if none is found
      
      

      if (!imageUrl) {
        alert('No image found for this destination.');
        return;
      }



      const newDestination = {
        name: searchTerm, 
        image_url: imageUrl
      };

      console.log('newDestination : ',newDestination)
  
      const response = await fetch(`${API_URL}/trips_likes/destination/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDestination),
      });

      if (!response.ok) throw new Error('Failed to add new Destination');
      const addedDestination = await response.json();
      setDestinationsData([...DestinationsData, addedDestination]);
      console.log(DestinationsData)
      setSearchTerm(''); // Reset the search term

    } catch (error) {
      console.error("Error adding new Destination: ", error);

    }
  };

  const handleDeleteDestination = async (name: string) => {
    try {
      // Make a DELETE request to your backend
      const response = await fetch(`${API_URL}/trips_likes/destination/delete/${encodeURIComponent(name)}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
      });
  
      if (response.ok) {
        // Filter out the deleted destination and update state
        const updatedDestinations = DestinationsData.filter(destination => destination.name !== name);
        setDestinationsData(updatedDestinations);
      } else {
        alert("Failed to delete the destination.");
      }
    } catch (error) {
      console.error("Error deleting the destination:", error);
    }
  };

 


  const handleOptionClick = (index: number): void => {
    setActiveIndex(index);
  };

  return (
    <div className="trip-options-container">


      {/* Header Section  working perfectly*/}
      <div className="header">
        <h1>Trip Buckets</h1>
        <button
          onClick={navigateToNavigationMenu}
          style={{
            marginLeft: '620px',
            backgroundColor: 'blue',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '15px',
            cursor: 'pointer',
            border: 'none', // Remove default button border
            outline: 'none', // Remove focus outline
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' // Optional: add a subtle shadow
          }}
          // style={{ backgroundColor: 'blue', color: 'white', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}
        >
          Home
        </button>
      </div>
      
      <div className="tab-navigation">
        <button 
          className={`tab-item ${activeTab === 'recommendations' ? 'active' : ''}`} 
          onClick={() => setActiveTab('recommendations')}
        >
          Recommendations
        </button>
        <button 
          className={`tab-item ${activeTab === 'custom' ? 'active' : ''}`} 
          onClick={() => setActiveTab('custom')}
        >
          Custom
        </button>
      </div>

      {/* Options Section */}
      <div className="tab-content">
        {activeTab === 'recommendations' && (

          <div className="options">
            

            {topRecommendations.map((rec: any, index) => (
              <OptionCard
                key={index}
                // trip_id={index} // Since we might not have trip_id, we can use index
                name={rec.city_name}
                image_url={rec.image_url}
                active={index === activeIndex} // Assuming we don't need an 'active' state here
                onClick={() => handleOptionClick(index)} // You can implement a click handler if needed
                onDelete={() => {}} // Same here for delete
              />
            ))}
            
          </div>
        )}
        {activeTab === 'custom' && ( 
        <div className="options">
          {DestinationsData.map((destination, index) => (
            <OptionCard
              key={index} 
              active={index === activeIndex}
              onClick={() => handleOptionClick(index)}
              image_url={destination.image_url}
              name={destination.name}
              onDelete={() => handleDeleteDestination(destination.name)}
            />
          ))}
        </div>
           )}
      </div> 


      {/* Search Bar - working perfectly*/}
      
      
      <div className="search-container">
        <form onSubmit={handleAddDestination}>
          <input
            ref={autocompleteRef}
            type="text"
            className="search-input"
            placeholder="Add destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Add to Bucket</button>
        </form>
      </div>
    </div>
  );
};


export default OptionsContainer;