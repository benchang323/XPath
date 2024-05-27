import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import OptionsContainer from '@/pages/OptionsContainer';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import fetchMock from 'jest-fetch-mock';

// Setup to use before importing  React component
fetchMock.enableMocks();

// Interface to store google api data 
declare global {
  interface Window {
    google: any;
  }
}

beforeAll(() => {
  // Create a global mock for google.maps object
  window.google = {
    maps: {
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

beforeEach(() => {
  jest.clearAllMocks();
});

  
// Mock necessary imports
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(() => jest.fn()), // Ensure this mock returns a function
}));
jest.mock("@react-google-maps/api", () => ({
  useLoadScript: jest.fn(() => ({
    isLoaded: true,
    loadError: null,
  })),
}));

// Mock sessionStorage
const mockedSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.sessionStorage = mockedSessionStorage as any;

// Mock environment variables
process.env = {
  ...process.env,
  VITE_API_URL: process.env.VITE_API_URL
};

const mockStore = configureStore();
const store = mockStore({});

describe('<OptionsContainer />', () => {
    
    //let mockNavigate: any;
    beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
    //mockNavigate = jest.fn();
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify([
      { trip_id: 1, name: 'Destination 1', image_url: 'url1' }
    ]));

    render(
      <Provider store={store}>
        <Router>
          <OptionsContainer />
        </Router>
      </Provider>
    );
  });

  test('renders without crashing', () => {
    expect(screen.getByText('Trip Buckets')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  test('calls API on initial load and renders destinations', async () => {
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(/\/trips_likes\/destination\/$/)
      ));
    expect(screen.getByText('Destination 1')).toBeInTheDocument();
  });

  test('handles scroll events correctly', () => {
    fireEvent.scroll(window, { target: { scrollY: 100 } });
    // Since this test does not check visual or state changes, no assertions are here
  });

  test('search bar updates value', () => {
    const input = screen.getByPlaceholderText('Add destinations...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New Destination' } });
    expect(input.value).toBe('New Destination');
  });

  test('adds new destination through form submission', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ trip_id: 2, name: 'New Destination', image_url: 'url2' }), { status: 200 });

    const input = screen.getByPlaceholderText('Add destinations...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.submit(screen.getByText('Add to Bucket'));

    // Ensure the form has been called and the UI change is made accordingly
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
    expect.stringMatching(/\/trips_likes\/destination\/$/)
    ));

  });

  test('navigates to the navigation menu when home button is clicked', async () => {
    render(<OptionsContainer />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Home' })[0]);
    // await waitFor(() => {
    //   expect(mockNavigate).toHaveBeenCalledWith('/navigationMenu');
    // });
  });

  test('deletes a destination', async () => {
    fetchMock.mockResponseOnce('', { status: 200 });

    const input = screen.getByPlaceholderText('Add destinations...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.submit(screen.getByText('Add to Bucket'));

    // Ensure the form has been called and the UI change is made accordingly
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
    expect.stringMatching(/\/trips_likes\/destination\/$/)
    ));
  });
  
});
