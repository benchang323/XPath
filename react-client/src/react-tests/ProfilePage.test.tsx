import { BrowserRouter as Router } from 'react-router-dom';
import {  render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import UserProfile from '@/pages/UserProfile'; // Update the import path if necessary

// Suppress warnings
beforeAll(() => {
  const originalWarn = console.warn.bind(console.warn);
  console.warn = (msg) => {
    if (!msg.toString().includes('changing an uncontrolled input of type undefined to be controlled')) {
      originalWarn(msg);
    }
  };
});
// const keyMap = {
//     "full_name": "Fullname (required)",
//     "preferred_name": "Preferred Name",
//     "gender": "Gender (required)",
//     "languages": "Languages",
//     "ethnicity": "Ethnicity",
//     "occupation": "Occupation (required)",
//     "birthdate": "Date of Birth (required)",
//     "hobbies": "Hobbies",
//     "interests": "Interests",
//     "country": "Your location: country (required)",
//     "state": "Your location: state (required)",
//     "city": "Your location: city (required)",
//     "zipcode": "Your location: zipcode (required)",
//     "favoriteAnimal": "Spirit Animal or Favorite Animal (required)",
//     "mostSpontaneous": "Most spontaneous thing that you have ever done?",
//     "favoriteMoviesTvShows": "Favorite Movies and TV shows",
//     "favoriteMusic": "Favorite Music",
//     "favoriteFood": "Favorite Food",
//     "zodiacSign": "Zodiac Sign",
//     "favoriteCartoonCharacter": "Favorite Cartoon Character",
//     "superpowerChoice": "Any superpower you want? (required)",
//     "favoriteColor": "Favorite Color?"
//   };
// Mock navigate function from react-router-dom
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
  },
});

describe('<UserProfile />', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const setup = async (props = {}) => {
    const utils = render(
      <Provider store={store}>
        <Router>
          <UserProfile {...props} />
        </Router>
      </Provider>
    );
    // If there are any async operations needed before returning, await them here
    // await waitForSomething();
    return utils;
  };
    

  test('renders without crashing', async () => {
    const { getByText } = await setup();
    expect(getByText('My Profile')).toBeInTheDocument();
  });

//   test('updates profile information when "Update My Basic Info" button is clicked', async () => {
//     const { getByText, queryByText, getByRole } = await setup();
//     fireEvent.click(getByText('Update My Basic Info'));
//     const saveButton = getByRole('button', { name: 'Save' });
//     fireEvent.click(saveButton);

//     await waitFor(() => {
//       expect(queryByText('Save')).not.toBeInTheDocument(); // Checking if the Save button is gone, indicating the end of the edit mode
//     });
//   });

  test('navigates away on sign out', async () => {
    const { getByText } = await setup();
    fireEvent.click(getByText('Sign Out'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

//   test('shows error when trying to save without required fields', async () => {
//     const { getByText, getByLabelText } = await setup();
//     fireEvent.click(getByText('Update My Basic Info'));
//     fireEvent.change(getByLabelText('Fullname (required)'), { target: { value: '' } }); // Clear a required field
//     fireEvent.click(getByText('Save'));

//     await waitFor(() => {
//       expect(getByText('This field is required')).toBeInTheDocument();
//     });
//   });



  test('renders the profile header', async () => {
    const { getByText } = await setup();
    expect(getByText('My Profile')).toBeInTheDocument();
  });

  test('renders the "Update My Basic Info" button', async () => {
    const { getByRole } = await setup();
    expect(getByRole('button', { name: /Update My Basic Info/i })).toBeInTheDocument();
  });

  test('renders the sign out button', async () => {
    const { getByRole } = await setup();
    expect(getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
  });

  test('renders the navigation menu button', async () => {
    const { getByRole } = await setup();
    expect(getByRole('button', { name: /Navigation Menu/i })).toBeInTheDocument();
  });

  test('renders delete account button', async () => {
    const { getByRole } = await setup();
    expect(getByRole('button', { name: /Delete Account/i })).toBeInTheDocument();
  });

//   test('renders all input fields when in edit mode', async () => {
//     const { getByLabelText } = await setup({ isEditing: true, editedProfile: { full_name: '', preferred_name: '' } });
//     expect(getByLabelText('Fullname (required)')).toBeInTheDocument();
//     expect(getByLabelText('Preferred Name')).toBeInTheDocument();
//   });
});
