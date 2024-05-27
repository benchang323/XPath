// src/pages/MapPage.tsx
import React, { useEffect, useState, useRef } from "react";
import { Button, Card, CardHeader, CardBody, CardFooter, Divider, Image } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/handlers/sidebar';
import { GoogleMap, DirectionsRenderer, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import "./MapPage.css";
import { setUserEmailRedux } from '../redux/userActions.ts';
import { useSelector, useDispatch } from 'react-redux';
const MapPage: React.FC = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = sessionStorage.getItem("bearerToken");
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [startStation, setStartStation] = useState("");
  const [endStation, setEndStation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [type, setType] = useState("");
  const [trips, setTrips] = useState<any[]>([]);
  const [editTripId, setEditTripId] = useState(null);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [selectedTripIds, setSelectedTripIds] = useState<number[]>([]);
  const [modeOfTransportation, setModeOfTransportation] = useState("");
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [startAutocomplete, setStartAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [endAutocomplete, setEndAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const bearerToken = sessionStorage.getItem("bearerToken");
  const grant_type = import.meta.env.VITE_grant_type;
  const client_id = import.meta.env.VITE_client_id;
  const client_secret = import.meta.env.VITE_client_secret;
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);


  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyBb2fVcyg2aCfvejujrwGrHte4upg_tF1c',
    libraries: ['places'],
  });

  const onLoad = (autocomplete: any) => {
    console.log('Autocomplete loaded:', autocomplete);
  };
  
  let autocomplete: any;  // Define it in an accessible scope

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      console.log('Place changed:', place);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    fetchItineraries();
  }, []);


  const fetchTrips = async () => {
    const token = sessionStorage.getItem("bearerToken");
    const response = await fetch(`${API_URL}/trips/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setTrips(data);
  };

  const fetchItineraries = async () => {
    const token = sessionStorage.getItem("bearerToken");
    const response = await fetch(`${API_URL}/trips/multiple-itineraries/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setItineraries(data);
  };

  const handleTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const startDateTime = `${startDate}T${startTime}:00`;
    const token = sessionStorage.getItem("bearerToken");
  
    const response = await fetch(`${API_URL}/trips/create/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        start: startStation,
        end: endStation,
        start_time: startDateTime,
        type: type,
      }),
    });
  
    if (response.ok) {
      setStartStation("");
      setEndStation("");
      setStartTime("");
      setStartDate("");
      setType("");

      fetchTrips();
  
      // Calculate the best transit route using Google Maps Directions API
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: startStation,
          destination: endStation,
          travelMode: google.maps.TravelMode.TRANSIT,
          transitOptions: {
            departureTime: new Date(startDateTime),
            routingPreference: google.maps.TransitRoutePreference.LESS_WALKING,
          },
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error("Directions request failed due to " + status);
          }
        }
      );
    } else {
      console.error("Failed to create trip");
    }
  };

  const handleEditClick = (tripId: any) => {
    setEditTripId(tripId);
  };

  const handleTripUpdate = async (tripId: any) => {
    const token = sessionStorage.getItem("bearerToken");
    const response = await fetch(`${API_URL}/trips/${tripId}/update/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ [editField]: editValue }),
    });
    if (response.ok) {
      setEditTripId(null);
      setEditField("");
      setEditValue("");
      fetchTrips();
    }
  };

  const handleTripDelete = async (tripId: any) => {
    const token = sessionStorage.getItem("bearerToken");
    if (window.confirm("Are you sure you want to delete this trip?")) {
      const response = await fetch(`${API_URL}/trips/${tripId}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        fetchTrips();
      }
    }
  };

  const handleTripSelect = (tripId: number) => {
    setSelectedTripIds((prevSelectedTripIds) => {
      if (prevSelectedTripIds.includes(tripId)) {
        return prevSelectedTripIds.filter((id) => id !== tripId);
      } else {
        return [...prevSelectedTripIds, tripId];
      }
    });
  };

        
  //trips bucket functions


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
    const selectedTrips = trips.filter((trip) => selectedTripIds.includes(trip[0]));
    const finalLocation = selectedTrips[selectedTrips.length - 1]?.[2] || "";


    const iataResponse = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations/cities?keyword=${finalLocation}&max=1`, {
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
    console.log(recommendationsData.data.map(city => city.name)); // Log the recommended cities' names
    if (recommendationsData && recommendationsData.data) {
      const cityNames = recommendationsData.data.map(city => city.name);
      console.log(cityNames);
      return cityNames;
    }
    return [];
    } catch (error) {
      console.error('Error making the request:', error);
      return [];
    }


  }

  const saveRecommendations = async (cityNames) => {
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
      console.log("Top 10 most liked locations:", topRecommendationsData);




    } catch (error) {
      console.error('Error saving recommendations:', error);
    }
  };


  //trips bucket functions
        
  useEffect(() => {
    if (isLoaded) {
      const startOptions = {
        fields: ['formatted_address', 'geometry', 'name'],
        strictBounds: false,
        types: ['geocode'],
      };

      const endOptions = {
        fields: ['formatted_address', 'geometry', 'name'],
        strictBounds: false,
        types: ['geocode'],
      };

      setStartAutocomplete(new google.maps.places.Autocomplete(startInputRef.current!, startOptions));
      setEndAutocomplete(new google.maps.places.Autocomplete(endInputRef.current!, endOptions));
    }
  }, [isLoaded]);
  
  useEffect(() => {
    if (startAutocomplete) {
      startAutocomplete.addListener('place_changed', () => {
        const place = startAutocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          setStartStation(place.formatted_address || '');
        }
      });
    }

    if (endAutocomplete) {
      endAutocomplete.addListener('place_changed', () => {
        const place = endAutocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          setEndStation(place.formatted_address || '');
        }
      });
    }
  }, [startAutocomplete, endAutocomplete]);

  

  const handleItinerarySubmit = async () => {
    const token = sessionStorage.getItem("bearerToken");
    const selectedTrips = trips.filter((trip) => selectedTripIds.includes(trip[0]));
    const initialLocation = selectedTrips[0]?.[1] || "";
    const finalLocation = selectedTrips[selectedTrips.length - 1]?.[2] || "";
  
    const response = await fetch(`${API_URL}/trips/multiple-itineraries/create/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        trip_ids: selectedTripIds.join(","),
        initial_location: initialLocation,
        final_location: finalLocation,
        mode_of_transportation: modeOfTransportation,
      }),
    });
  
    if (response.ok) {
      setSelectedTripIds([]);
      setModeOfTransportation("");
  
      fetchItineraries();

      //trips bucket functions
      const recommendations = await generateRecommendations();
      console.log('recommendations:',recommendations)
      if (recommendations.length > 0) {
        await saveRecommendations(recommendations);
      }

    } else {
      console.error("Failed to create itinerary");
    }
  };

  const handleItineraryDelete = async (itineraryId: any) => {
    const token = sessionStorage.getItem("bearerToken");
    if (window.confirm("Are you sure you want to delete this itinerary?")) {
      const response = await fetch(`${API_URL}/trips/multiple-itineraries/${itineraryId}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        fetchItineraries(); 
      } else {
        console.error("Failed to delete itinerary");
      }
    }
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch(`${API_URL}/user_account/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include the bearer token if available
          Authorization: `Bearer ${token}`,
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


  return (
    <div>
      <div className="flex items-center justify-between py-4 text-white bg-black px-7">
          <a href="/" className="text-xl font-bold">xPath</a>
          <div>
            <Button onPress={handleSignOut} color="white" size="small" variant="ghost">Sign Out</Button>
          </div>
      </div>
      <div className="main-container">
        <Sidebar />
        <div className="map-page">
          <div className="map-container">
            <div className="map-form">
              <form onSubmit={handleTripSubmit}>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Starting Location"
                    value={startStation}
                    onChange={(e) => setStartStation(e.target.value)}
                    className="form-input"
                    ref={startInputRef}
                  />
                  <input
                    type="text"
                    placeholder="Ending Location"
                    value={endStation}
                    onChange={(e) => setEndStation(e.target.value)}
                    className="form-input"
                    ref={endInputRef}
                  />
                  <input
                    type="date"
                    placeholder="Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-row">
                  <input
                    type="time"
                    placeholder="Time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="form-input"
                  />
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Type</option>
                    <option value="plane">Plane</option>
                    <option value="bus">Bus</option>
                    <option value="train">Train</option>
                  </select>
                  <button type="submit" className="form-button">Submit</button>
                </div>
              </form>
            </div>
            <div className="map-wrapper">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ height: "100%", width: "100%" }}
                  center={{ lat: 40.729949951171875, lng: -73.99842071533203 }}
                  zoom={12}
                >
                  <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                  <input
                    type="text"
                    placeholder="Starting Location"
                    value={startStation}
                    onChange={(e) => setStartStation(e.target.value)}
                    className="form-input"
                    ref={startInputRef}
                  />
                  </Autocomplete>
                  <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                  <input
                    type="text"
                    placeholder="Ending Location"
                    value={endStation}
                    onChange={(e) => setEndStation(e.target.value)}
                    className="form-input"
                    ref={endInputRef}
                  />
                  </Autocomplete>
                  {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
              ) : (
                <div>Loading...</div>
              )}
            </div>
          </div>
          <div className="trips-section">
            <div className="trips-list">
              <h2>My Trips</h2>
              {Array.isArray(trips) && trips.length > 0 ? (
                <div className="trips-list-container">
                  <ul>
                    {trips.map((trip) => (
                      <div className="trip-container" key={trip[0]}>
                        <li className="trip-item">
                          <div className="trip-details">
                            <input
                              type="checkbox"
                              checked={selectedTripIds.includes(trip[0])}
                              onChange={() => handleTripSelect(trip[0])}
                              className="trip-checkbox"
                            />
                            <span className="trip-info"><strong>Type:</strong> {trip[4]}</span>
                            <span className="trip-info"><strong>Start:</strong> {trip[1]}</span>
                            <span className="trip-info"><strong>End:</strong> {trip[2]}</span>
                            <span className="trip-info"><strong>Start Time:</strong> {trip[5]}</span>
                          </div>
                          <div className="trip-actions">
                            <button onClick={() => handleEditClick(trip[0])} className="edit-button">
                              Edit
                            </button>
                            <button onClick={() => handleTripDelete(trip[0])} className="delete-button">
                              Delete
                            </button>
                          </div>
                        </li>
                        {editTripId === trip[0] && (
                          <div className="trip-edit">
                            <select
                              value={editField}
                              onChange={(e) => setEditField(e.target.value)}
                              className="edit-select"
                            >
                              <option value="">Select Field to Edit</option>
                              <option value="type">Type</option>
                              <option value="start">Start</option>
                              <option value="end">End</option>
                              <option value="start_time">Start Time</option>
                            </select>
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder="Enter new value"
                              className="edit-input"
                            />
                            <button onClick={() => handleTripUpdate(trip[0])} className="save-button">
                              Save
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                  </ul>
                </div>
              ) : (
                <p>No trips found.</p>
              )}
              <div className="itinerary-form">
                <select
                  value={modeOfTransportation}
                  onChange={(e) => setModeOfTransportation(e.target.value)}
                  className="itinerary-select"
                >
                  <option value="">Mode of Transportation</option>
                  <option value="plane">Plane</option>
                  <option value="bus">Bus</option>
                  <option value="train">Train</option>
                </select>
                <button
                  onClick={handleItinerarySubmit}
                  className="itinerary-button"
                >
                  Batch Trips
                </button>
              </div>
            </div>
          </div>  
          <div className="itineraries-section">
            <div className="itineraries-list">
              <h2>My Itineraries</h2>
              {Array.isArray(itineraries) && itineraries.length > 0 ? (
                <div className="itineraries-list-container">
                  <ul>
                    {itineraries.map((itinerary) => (
                      <li key={itinerary.id} className="itinerary-item">
                        <div className="itinerary-details">
                          <span className="itinerary-info">Itinerary ID: {itinerary.id}</span>
                          <span className="itinerary-info">Trip IDs: {itinerary.trip_ids}</span>
                          <span className="itinerary-info">Initial Location: {itinerary.initial_location}</span>
                          <span className="itinerary-info">Final Location: {itinerary.final_location}</span>
                          <span className="itinerary-info">Mode of Transportation: {itinerary.mode_of_transportation}</span>
                        </div>
                        <div className="itinerary-actions">
                          <button onClick={() => handleItineraryDelete(itinerary.id)} className="delete-button">
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No itineraries found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
