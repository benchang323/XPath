// Matching.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserProfile } from '../pages/Matching';

describe('UserProfile Component', () => {
  const mockProfile = {
    id: '123456',
    interests: ['Reading', 'Traveling'],
    gender: 'Female',
    job: 'Software Engineer',
    bio: 'Loves programming and outdoor activities',
    industry: 'Technology',
    languages: ['English', 'Spanish'],
    ethnicity: 'Hispanic',
    hometown: 'Madrid',
    currentCity: 'San Francisco',
  };
  const mockOnMatch = jest.fn();
  const mockOnReject = jest.fn();
  beforeEach(() => {
    render(
      <UserProfile
        profile={mockProfile}
        onMatch={mockOnMatch}
        onReject={mockOnReject}
      />
    );
  });
  it('renders profile information correctly', () => {
    expect(screen.getByText(/Interests: Reading, Traveling/i)).toBeInTheDocument();
    expect(screen.getByText(/Bio: Loves programming and outdoor activities/i)).toBeInTheDocument();
    // Continue for the rest of the profile attributes...
  });
  it('calls onMatch when the Match button is clicked', () => {
    fireEvent.click(screen.getByText(/Match/i));
    expect(mockOnMatch).toHaveBeenCalledTimes(1);
  });
  it('calls onReject when the Reject button is clicked', () => {
    fireEvent.click(screen.getByText(/Reject/i));
    expect(mockOnReject).toHaveBeenCalledTimes(1);
  });
});