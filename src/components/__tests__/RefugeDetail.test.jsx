import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RefugeDetail from '../RefugeDetail.jsx';

describe('RefugeDetail (AC 2.1.2)', () => {
  it('Scenario 1: shows category, address and walking distance for a complete record', () => {
    render(
      <RefugeDetail
        refuge={{
          id: 12,
          name: 'State Library Victoria',
          category: 'library',
          address: '328 Swanston St, Melbourne',
          walkingDistanceMetres: 240,
        }}
      />,
    );

    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('328 Swanston St, Melbourne')).toBeInTheDocument();
    expect(screen.getByText('240 m')).toBeInTheDocument();
  });

  it('Scenario 2: shows "Unavailable" for a missing field rather than leaving it blank', () => {
    render(
      <RefugeDetail
        refuge={{
          id: 47,
          name: 'Flagstaff Gardens',
          category: 'park',
          address: null,
          walkingDistanceMetres: 480,
        }}
      />,
    );

    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });
});
