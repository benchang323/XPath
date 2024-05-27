import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom'; // Needed to wrap component because of useNavigate
import EmailVerification from '../pages/EmailVerification';

// Mock useLocation hook to simulate receiving email state
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useLocation: () => ({
    state: { email: 'test@example.com' }
  }),
}));

describe('EmailVerification Component', () => {
  it('renders the verification form', () => {
    render(
      <BrowserRouter>
        <EmailVerification />
      </BrowserRouter>
    );
    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument();
  });

  it('allows entering a verification code', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <EmailVerification />
      </BrowserRouter>
    );
    await user.type(screen.getByPlaceholderText(/enter code/i), '123456');
    expect(screen.getByPlaceholderText(/enter code/i)).toHaveValue('123456');
  });

});
