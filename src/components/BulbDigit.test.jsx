import { render, screen } from '@testing-library/react';
import BulbDigit from './BulbDigit.jsx';
import React from 'react';

describe('BulbDigit', () => {
  it('renders all bulbs for digit 8', () => {
    render(<BulbDigit digit={8} />);
    // 7 segments × 3 bulbs per segment = 21 bulbs for digit 8
    const bulbs = screen.getAllByTestId('bulb-segment');
    expect(bulbs.length).toBe(21);
  });
});
