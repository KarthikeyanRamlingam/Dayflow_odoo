import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatCard } from './StatCard';
import { Users } from 'lucide-react';

describe('StatCard component', () => {
  it('renders title, value, and subtitle correctly', () => {
    render(
      <StatCard
        title="Active Members"
        value="42"
        subtitle="Full-time staff"
        icon={<Users data-testid="user-icon" />}
        trend="+5%"
      />
    );

    expect(screen.getByText('Active Members')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Full-time staff')).toBeInTheDocument();
    expect(screen.getByText('+5%')).toBeInTheDocument();
  });
});
