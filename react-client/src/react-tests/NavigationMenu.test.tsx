import { BrowserRouter as Router } from 'react-router-dom';
import { act,render,  fireEvent,RenderResult,waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import NavigationMenu from '@/pages/NavigationMenu'; // Check your path alias configuration
// Supressing warnings
const originalWarn = console.warn;
console.warn = (...args) => {
    if (/changing an uncontrolled input of type undefined to be controlled/.test(args[0])) {
        return;
    }
    originalWarn(...args);
};
// Mock the navigate function from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Create a mock store for your tests
const mockStore = configureStore();
const store = mockStore({
  user: {
    userEmail: 'test@example.com',
     // Mocked email address
  },
});

describe('<NavigationMenu />', () => {
  let getByText: RenderResult['getByText'];
  let getByAltText: RenderResult['getByAltText'];
  let getByRole: RenderResult['getByRole'];
  //let getAllByText: RenderResult['getAllByText'];
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  beforeAll(() => {
    // Supressing warnings
    console.error = (...args) => {
      if (/Warning.*not wrapped in act\(...\)/.test(args[0])) {
        return;
      }
      originalConsoleError.call(console, ...args);
    };
    console.warn = (message, ...args) => {
      // Check the message and suppress specific warnings
      if (/Consecutive calls to connectUser is detected/.test(message)) {
        return;
      }
      // Otherwise, call the original console.warn with all arguments
      originalConsoleWarn.call(console, message, ...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;

  });
  beforeEach(async () => {
    await act(async () => {
      fetchMock.resetMocks();
      fetchMock.mockResponse(req => {
        if (req.url.includes('/matching/profile')) {
          return Promise.resolve(JSON.stringify({
            profile: { full_name: 'John Doe' }
          }));
        }
        if (req.url.includes('/matching/profile/avatarPicUrl')) {
          return Promise.resolve(JSON.stringify({
            url: 'https://example.com/avatar.jpg'
          }));
        }
        if (req.url.includes('/user_account/logout')) {
          return Promise.resolve(JSON.stringify({ status: 'success' }));
        }
        if (req.url.includes('/chat/user')) {
          return Promise.resolve(JSON.stringify({
            streamChatToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNDA1In0.xQkhUGehJhlpiKz04NvLAKFQemCq4Z-DFHVk-7pn8bQ',
            profileId: '405',
            name: 'John Doe'
          }));
        }
        return Promise.resolve(JSON.stringify({}));
      });
      });
      const utils = render(
        <Provider store={store}>
          <Router>
            <NavigationMenu />
          </Router>
        </Provider>
      );
      getByText = utils.getByText;
      getByAltText = utils.getByAltText;
      getByRole = utils.getByRole;
    });
    test('navigates to the matching page when "Matching" button is clicked', async () => {
      act(() => {
        fireEvent.click(getByRole('button', { name: 'Matching' }));
      });
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/matching');
      });
    });
  
    test('navigates to the trips page when "Trips" button is clicked', () => {
      act(() => {
        fireEvent.click(getByText('Trips'));
      });
      expect(mockNavigate).toHaveBeenCalledWith('/mappage');
    });
  
    test('navigates to the preferences page when "Preferences" button is clicked', () => {
      act(() => {
        fireEvent.click(getByText('Preferences'));
      });
      expect(mockNavigate).toHaveBeenCalledWith('/preferences');
    });
  
    test('navigates to the chat page when "Chat" button is clicked', () => {
      act(() => {
        fireEvent.click(getByText('Chat'));
      });
      expect(mockNavigate).toHaveBeenCalledWith('/chat');
    });
  
    test('navigates to the bucket list page when "Bucket List" button is clicked', () => {
      act(() => {
        fireEvent.click(getByText('Bucket List'));
      });
      expect(mockNavigate).toHaveBeenCalledWith('/trips-bucket');
    });
  
  test('renders without crashing', () => {
    expect(getByText('Good to see you,')).toBeInTheDocument();
  });

  test('renders sign out button correctly', () => {
    expect(getByText('Sign Out')).toBeInTheDocument();
  });

  test('renders user avatar correctly', () => {
    expect(getByAltText('Avatar')).toBeInTheDocument();
  });


  // Test if the 'Trips' button is rendered correctly
  test('renders the "Trips" button correctly', () => {
    const tripsButton = getByText('Trips');
    expect(tripsButton).toBeInTheDocument();
  });

  // Test if the 'Preferences' button is rendered correctly
  test('renders the "Preferences" button correctly', () => {
    const preferencesButton = getByText('Preferences');
    expect(preferencesButton).toBeInTheDocument();
  });

  // Test if the 'Chat' button is rendered correctly
  test('renders the "Chat" button correctly', () => {
    const chatButton = getByText('Chat');
    expect(chatButton).toBeInTheDocument();
  });

  // Test if the 'Bucket List' button is rendered correctly
  test('renders the "Bucket List" button correctly', () => {
    const bucketListButton = getByText('Bucket List');
    expect(bucketListButton).toBeInTheDocument();
  });
});