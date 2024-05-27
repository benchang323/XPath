import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import SignUp from '../pages/SignUp';
import { BrowserRouter } from 'react-router-dom'; // Necessary for useNavigate

describe('SignUp Component', () => {
  it('renders the sign-up form', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    // Check for input fields and button
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('allows users to fill in the form', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    // Simulate user typing in the form fields
    await user.type(screen.getByPlaceholderText(/username/i), 'testuser');
    await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'password');
    await user.type(screen.getByPlaceholderText(/phone number/i), '1234567890');

    // Verify input values
    expect(screen.getByPlaceholderText(/username/i)).toHaveValue('testuser');
    expect(screen.getByPlaceholderText(/email/i)).toHaveValue('test@example.com');
    expect(screen.getByPlaceholderText(/password/i)).toHaveValue('password');
    expect(screen.getByPlaceholderText(/phone number/i)).toHaveValue('1234567890');
  });

  // Test for form submission, error handling, etc.
  // Mock the fetch API or the backend API call function to test the form submission.
});
