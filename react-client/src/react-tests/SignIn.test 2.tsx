import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import SignIn from '../pages/SignIn';
import { BrowserRouter } from 'react-router-dom'; // Needed to wrap component because of useNavigate

describe('SignIn Component', () => {
  it('renders the sign-in form', () => {
    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    // Add more expectations as needed
  });

  it('allows users to input email and password', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );

    await user.type(screen.getByPlaceholderText(/email/i), 'user@example.com');
    expect(screen.getByPlaceholderText(/email/i)).toHaveValue('user@example.com');

    await user.type(screen.getByPlaceholderText(/password/i), 'password');
    expect(screen.getByPlaceholderText(/password/i)).toHaveValue('password');
    // Add more interactions as needed
  });

  // Add tests for form submission, error handling, etc.
});
