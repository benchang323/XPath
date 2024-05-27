
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';
import Home from '@/pages/HomePage'; // Update the import path to the actual location of your HomePage component

// Mock the navigate function from 'react-router-dom'
const mockNavigate = jest.fn();
// Create a mock store
const mockStore = configureStore([]);
const store = mockStore({});

// Mocking modules
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  jest.clearAllMocks();
});


describe('HomePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderHomePage = () =>
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </Provider>
    );

  it('should render the homepage correctly', () => {
    renderHomePage();
    expect(screen.getByText(/like-minded commute and travel buddies/i)).toBeInTheDocument();
    expect(screen.getByAltText('Your Image')).toBeInTheDocument();
    expect(screen.getByText(/let's travel together/i)).toBeInTheDocument();
    
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
    expect(screen.getAllByText(/xPath/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/© 2024 xPath. All rights reserved./i)).toBeInTheDocument();
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
  });


  it('should open the create account modal when create account button is clicked', async () => {
    renderHomePage();
    fireEvent.click(screen.getByText(/create account/i));
    expect(screen.getByText(/username/i)).toBeInTheDocument();
    expect(screen.getByText(/email/i)).toBeInTheDocument();
    expect(screen.getByText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByText(/birth date/i)).toBeInTheDocument();
  });

  it('should allow input in the create account modal', async () => {
    renderHomePage();
    fireEvent.click(screen.getByText(/create account/i));

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'johndoe' },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/phone number/i), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByPlaceholderText(/birth date/i), {
      target: { value: '1990-01-01' },
    });

    await waitFor(() => {
      expect((screen.getByPlaceholderText(/username/i) as HTMLInputElement).value).toBe('johndoe');
      expect((screen.getByPlaceholderText(/email/i) as HTMLInputElement).value).toBe('john@example.com');
      expect((screen.getByPlaceholderText(/password/i) as HTMLInputElement).value).toBe('password123');
      expect((screen.getByPlaceholderText(/phone number/i) as HTMLInputElement).value).toBe('1234567890');
      expect((screen.getByPlaceholderText(/birth date/i) as HTMLInputElement).value).toBe('1990-01-01');
    });
  });

  it('should submit the create account form', async () => {
    renderHomePage();
  
    // Open the create account modal
    const createAccountButtons = screen.getByText(/create account/i);
    fireEvent.click(createAccountButtons); // Click the first instance if there are multiple
  
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'johndoe' },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/phone number/i), {
      target: { value: '1234567890' },
    });
  
    // Submit the form
    const submitButtons = screen.getAllByText(/create account/i);
    fireEvent.click(submitButtons[submitButtons.length -1 ]); // Click the last instance, assuming it's the submit button
  
     // Upon clikcing it should re render the home page again
    expect(screen.getByText(/like-minded commute and travel buddies/i)).toBeInTheDocument();
    expect(screen.getByAltText('Your Image')).toBeInTheDocument();
    expect(screen.getByText(/let's travel together/i)).toBeInTheDocument();
    
    expect(screen.getAllByText(/create account/i)[0]).toBeInTheDocument();
  });
  it('renders the sign-in modal with initial empty inputs', () => {
    renderHomePage();
    fireEvent.click(screen.getByText(/Sign In/i));
    expect(screen.getByPlaceholderText('Enter your email')).toHaveValue('');
    expect(screen.getByPlaceholderText('Enter your password')).toHaveValue('');
  });
  it('allows input into email and password fields', () => {
    renderHomePage();
    fireEvent.click(screen.getByText(/Sign In/i));
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });
  it('submits the form with valid credentials', async () => {
    renderHomePage();
    fireEvent.click(screen.getByText(/Sign In/i));
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      }));
    });    
  });
  

});
