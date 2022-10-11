import { render, screen } from '@testing-library/react';
import App from './App';
import React from 'react';

test('renders learn react link', () => {
  render(<App />);
  const reportButton = screen.getByText(/brücke erfassen/i);
  expect(reportButton).toBeInTheDocument();
});
