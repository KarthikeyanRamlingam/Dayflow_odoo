import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Badge } from './Badge';

describe('Badge component', () => {
  it('renders status text correctly', () => {
    render(<Badge status="APPROVED" />);
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('renders custom children when provided', () => {
    render(<Badge variant="success">Custom Active</Badge>);
    expect(screen.getByText('Custom Active')).toBeInTheDocument();
  });
});
