import React, { useEffect } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

const containerStyle: React.CSSProperties = {
  width: "400px",
  height: "400px",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

const origin = { lat: 37.77, lng: -122.42 }; // Example origin coordinates
const destinations = [
  { lat: 37.79, lng: -122.41 }, // Example destination coordinates
  { lat: 37.8, lng: -122.4 }, // Another example destination coordinates
];

const MyComponent: React.FC = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCIhmq0n2kWEHsq6t0pVoQWi_DE1URYyMI",
  });

  useEffect(() => {
    if (isLoaded) {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer();

      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: center,
        zoom: 10,
      });

      directionsRenderer.setMap(map);

      const waypoints = destinations.map((destination) => ({
        location: destination,
        stopover: true,
      }));

      const request = {
        origin: origin,
        destination: origin, // Set the origin again as the destination for returning to the starting point
        waypoints: waypoints,
        optimizeWaypoints: true, // To optimize the route for the fastest route
        travelMode: window.google.maps.TravelMode.DRIVING,
      };

      directionsService.route(request, function (result, status) {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        } else {
          console.error("Error fetching directions:", status);
        }
      });
    }
  }, [isLoaded]);

  if (loadError) return <div>Error loading maps</div>;

  return (
    <div style={containerStyle} id="map">
      {/* Map will be rendered here */}
    </div>
  );
};

export default MyComponent;
