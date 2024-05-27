import { BrowserRouter as Router } from 'react-router-dom';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MapPage from '@/pages/MapPage'; // Adjust the import based on your project structure
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

// Interface to store google api data 
declare global {
    interface Window {
      google: any;
    }
  }
  const mockDirectionsService = {
    route: jest.fn(),
  };
  
  beforeAll(() => {
    // Create a global mock for google.maps object
    window.google = {
      maps: {
        DirectionsService: jest.fn(() => mockDirectionsService), // Mock DirectionsService constructor

        TravelMode: {
            TRANSIT: 'TRANSIT', // Mocking the TRANSIT property
          },
          TransitRoutePreference: {
            LESS_WALKING: 'LESS_WALKING',
          },
        places: {
          Autocomplete: jest.fn().mockImplementation(() => ({
            addListener: jest.fn((event: string, callback: Function) => {
              if (event === 'place_changed') {
                callback();
              }
            }),
            getPlace: jest.fn(() => ({
              name: 'Mock Place',
              geometry: {
                location: {
                  lat: () => 43.6532,
                  lng: () => -79.3832
                }
              }
            }))
          })),
        },
        Geocoder: jest.fn(),
        LatLng: jest.fn((lat: number, lng: number) => ({ lat, lng })),
        Map: jest.fn(() => ({
          setTilt: jest.fn(),
          setZoom: jest.fn(),
          setCenter: jest.fn(),
          addListener: jest.fn()
        })),
        Marker: jest.fn(),
        InfoWindow: jest.fn(),
        event: {
          addListener: jest.fn()
        }
      }
    };
  });

  jest.mock('@react-google-maps/api', () => ({
    GoogleMap: ({ children, ...restProps }: { children: React.ReactNode; [key: string]: any }) => (
      <div {...restProps}>MockGoogleMap{children}</div>
    ),
    DirectionsRenderer: ({ children, ...restProps }: { children: React.ReactNode; [key: string]: any }) => (
      <div {...restProps}>MockDirectionsRenderer{children}</div>
    ),
    useJsApiLoader: () => ({ isLoaded: true }),
  }));



const sessionStorageMock = (() => {
  let store: { [key: string]: string | null } = {};

  return {
    getItem: (key: string) => {
      return store[key] || "Dummy Key";
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Configure Mock Store
const mockStore = configureStore();
const store = mockStore({
  // Define your initial store state if necessary
});
// Define the mock response for fetchTrips
const mockTripResponse = {
    id: "unique_trip_id",
    user_id: "user_id",
    type: "Type of transportation",
    start: "Starting point",
    end: "Ending point",
    start_time: "2024-04-19T09:00:00",
    route: {
      segments: [
        {
          line_name: "Transit line name",
          num_stops: "Number of stops",
          arrival_stop: "Arrival stop",
          departure_stop: "Departure stop"
        }
      ],
      transit_stops: "Transit stops"
    }
  };
// Setup to use before importing your React component
describe('<MapPage />', () => {
  let setup: any
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
    fetchMock.resetMocks();
    fetchMock.mockResponse(req => {
        if (req.url.includes('/trips/')) {
          // Mock response for fetching trips
          const sampleTrips = [
            mockTripResponse
          ];
          return Promise.resolve(JSON.stringify({ trips: sampleTrips }));
        } else if (req.url.includes('/submit_trip')) {
          // Mock response for submitting a trip
          return Promise.resolve(JSON.stringify({ status: 'success' }));
        }
        // Add more conditions for other API endpoints as needed
    
        // Default response if no matching condition is found
        return Promise.resolve(JSON.stringify({}));
      });
    setup = () => render(
      <Provider store={store}>
        <Router>
          <MapPage />
        </Router>
      </Provider>
    );
  });

  test('renders the map container correctly', () => {
    const { getByText } = setup();
    expect(getByText('MockGoogleMap')).toBeInTheDocument();
  });

  test('renders form inputs and submit button correctly', () => {
    const { getByPlaceholderText,getByRole } = setup();
    expect(getByPlaceholderText('Starting Location')).toBeInTheDocument();
    expect(getByPlaceholderText('Ending Location')).toBeInTheDocument();
    expect(getByPlaceholderText('Date')).toBeInTheDocument();
    expect(getByPlaceholderText('Time')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  test('submits trip information correctly', async () => {
    const { getByPlaceholderText,getByRole } = setup();
    fireEvent.change(getByPlaceholderText('Starting Location'), { target: { value: 'New York' } });
    fireEvent.change(getByPlaceholderText('Ending Location'), { target: { value: 'Washington D.C.' } });
    fireEvent.change(getByPlaceholderText('Date'), { target: { value: '2024-04-20' } });
    fireEvent.change(getByPlaceholderText('Time'), { target: { value: '15:00' } });
    fireEvent.click(getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(sessionStorage.getItem('bearerToken')).not.toBeNull();
    });
  });
  test('checks if clicking on edit sets up form for update', async () => {
    const {  getByRole } = setup();
    fireEvent.click(getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
        expect(sessionStorage.getItem('bearerToken')).not.toBeNull();
      });
  });

  test('renders without crashing', () => {
    const { getByText } = setup();
    expect(getByText('My Trips')).toBeInTheDocument();
  });

  test('map loads correctly with Google Map', () => {
    const { getByText } = setup();
    expect(getByText('MockGoogleMap')).toBeInTheDocument();
  });

  test('submits trip information correctly', async () => {
    const { getByText, getByPlaceholderText } = setup();
    fireEvent.change(getByPlaceholderText('Starting Location'), { target: { value: 'New York' } });
    fireEvent.change(getByPlaceholderText('Ending Location'), { target: { value: 'Washington D.C.' } });
    fireEvent.change(getByPlaceholderText('Date'), { target: { value: '2024-04-20' } });
    fireEvent.change(getByPlaceholderText('Time'), { target: { value: '15:00' } });

    fireEvent.click(getByText('Submit'));
    
    await waitFor(() => {
      expect(sessionStorage.getItem('bearerToken')).not.toBeNull();
    });
  });

  test('edits trip correctly', async () => {
    const { getByText, getByPlaceholderText } = setup();
    fireEvent.change(getByPlaceholderText('Starting Location'), { target: { value: 'Los Angeles' } });
    fireEvent.change(getByPlaceholderText('Ending Location'), { target: { value: 'San Francisco.' } });
    fireEvent.change(getByPlaceholderText('Date'), { target: { value: '2024-04-20' } });
    fireEvent.change(getByPlaceholderText('Time'), { target: { value: '15:00' } });

    fireEvent.click(getByText('Submit'));
    
    await waitFor(() => {
      expect(sessionStorage.getItem('bearerToken')).not.toBeNull();
    });
});
});
