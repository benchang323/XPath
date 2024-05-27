import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ProfileCard from '../pages/ProfileCard';
import { BrowserRouter } from 'react-router-dom'; // Needed to wrap component because of useNavigate

describe('ProfileCreation Component', () => {
  it('renders the profile creation form', () => {
    render(
      <BrowserRouter>
        <ProfileCard />
      </BrowserRouter>
    );

    // Check for input fields
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    // Add assertions for other fields as necessary

    // Check for buttons
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    // Add assertions for other buttons/actions as necessary
  });

  it('allows user to enter profile information', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ProfileCard />
      </BrowserRouter>
    );

    // Simulate user typing into the input fields
    await user.type(screen.getByLabelText(/Full Name/i), 'Jane Doe');
    expect(screen.getByLabelText(/Full Name/i)).toHaveValue('Jane Doe');

    await user.type(screen.getByLabelText(/Email/i), 'jane@example.com');
    expect(screen.getByLabelText(/Email/i)).toHaveValue('jane@example.com');

    // Continue with other fields as necessary
  });

  // Add more tests to simulate form submission, handling errors, etc.
});
