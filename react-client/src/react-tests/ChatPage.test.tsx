import { act, render, fireEvent, RenderResult, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import ChatPage from '@/pages/ChatPage'; // Check your path alias configuration
import fetchMock from 'jest-fetch-mock';

// Mock the navigate function from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Supressing warnings
const originalWarn = console.warn;
console.warn = (...args) => {
    if (/changing an uncontrolled input of type undefined to be controlled/.test(args[0])) {
        return;
    }
    originalWarn(...args);
};

// Create a mock store for your tests
const mockStore = configureStore();
const store = mockStore({
  user: {
    userEmail: 'test@example.com', // Mocked email address
  },
});

describe('<ChatPage />', () => {
  let getByText: RenderResult['getByText'];
  let getByRole: RenderResult['getByRole'];
  const originalConsoleWarn = console.warn;
  beforeAll(() => {
    // Supressing warnings
    console.warn = (message, ...args) => {
      // Check the message and suppress specific warnings
      if (/Consecutive calls to connectUser is detected/.test(message)) {
        return;
      }
      // Otherwise, call the original console.warn with all arguments
      originalConsoleWarn.call(console, message, ...args);
    };
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
      const utils = render(
        <Provider store={store}>
          <Router>
            <ChatPage />
          </Router>
        </Provider>
      );
      getByText = utils.getByText;
      getByRole = utils.getByRole;
    });
  });

  test('renders sign out button correctly', () => {
    expect(getByText('Sign Out')).toBeInTheDocument();
  });

  test('renders chat window with loading message', () => {
    expect(getByText('Loading chat...')).toBeInTheDocument();
  });

  test('navigates to home page when "Sign Out" button is clicked', async () => {
    act(() => {
      fireEvent.click(getByRole('button', { name: 'Sign Out' }));
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
// checked in the nav page so we dont need to check here - adding the code here anyways
//   test('initializes chat client and connects user successfully', async () => {
//     await waitFor(() => {
//       // Check if the chat client has been initialized with the correct token
//       expect(fetchMock).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
//         headers: expect.objectContaining({
//           Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNDA1In0.xQkhUGehJhlpiKz04NvLAKFQemCq4Z-DFHVk-7pn8bQ`,
//         })
//       }));
//       // This assumes you have a mock or a way to verify the client has been initialized
//       // e.g., mock StreamChat.getInstance() or similar
//     });
//   });
//   test('renders messages from selected channel', async () => {
//     // Simulate channel selection (you might need to adjust based on your implementation)
//     act(() => {
//       fireEvent.click(getByText('Channel Name')); // Replace 'Channel Name' with a real example or mock
//     });
    
//     await waitFor(() => {
//       // Check that messages from the channel are displayed
//       expect(getByText('Message content')).toBeInTheDocument();
//     });
//   });
//   test('allows user to send messages', async () => {
//   // Assume that there is an input field for messages and a send button
//   const messageInput = getByRole('textbox', { name: 'Message Input' });
//   const sendButton = getByRole('button', { name: 'Send' });

//   act(() => {
//     fireEvent.change(messageInput, { target: { value: 'Hello, world!' } });
//     fireEvent.click(sendButton);
//   });

//   await waitFor(() => {
//     // Check that the message was sent (you might need to mock a function that handles sending)
//     expect(fetchMock).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
//       body: JSON.stringify({
//         message: 'Hello, world!'
//       })
//     }));
//   });
// });

});
