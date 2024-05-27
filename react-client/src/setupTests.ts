import '@testing-library/jest-dom';
import fetch from 'node-fetch';
global.fetch = fetch as unknown as typeof global.fetch;
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.resetMocks();
});

