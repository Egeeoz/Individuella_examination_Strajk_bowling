import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import Booking from '../views/Booking';
import Confirmation from '../views/Confirmation';

// Setup server
const server = setupServer(
  http.post('https://h5jbtjv6if.execute-api.eu-north-1.amazonaws.com', () => {
    return HttpResponse.json({
      id: 'mock-id',
      price: 340,
      when: '2024-12-24T14:00',
      lanes: 1,
      people: 2,
      shoes: ['42', '42'],
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  sessionStorage.clear();
});
afterAll(() => server.close());

describe('Navigation functionality', () => {
  test('should navigate to confirmation page after successful booking', async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: '2024-12-24' },
    });

    fireEvent.change(screen.getByLabelText(/time/i), {
      target: { value: '14:00' },
    });

    fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), {
      target: { value: '2' },
    });

    fireEvent.change(screen.getByLabelText(/Number of lanes/i), {
      target: { value: '1' },
    });

    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByText('+'));
    }
    const shoeInputs = document.querySelectorAll('.shoes__input');
    shoeInputs.forEach((input) => {
      fireEvent.change(input, { target: { value: '42' } });
    });

    fireEvent.click(screen.getByText(/strIIIIIike!/i));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/confirmation');
    });
  });

  test('should show no booking message when confirmation page is empty', () => {
    sessionStorage.clear();

    window.history.pushState({}, '', '/confirmation');

    render(
      <BrowserRouter>
        <Confirmation />
      </BrowserRouter>
    );

    expect(screen.getByText('Inga bokning gjord!')).toBeInTheDocument();
  });

  test('should show booking details when session storage has booking data', () => {
    const mockBooking = {
      id: 'mock-id',
      price: 340,
      when: '2024-12-24T14:00',
      lanes: 1,
      people: 2,
      shoes: ['42', '42'],
    };

    sessionStorage.setItem('confirmation', JSON.stringify(mockBooking));

    render(
      <BrowserRouter>
        <Confirmation />
      </BrowserRouter>
    );

    expect(screen.getByDisplayValue('2024-12-24 14:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('mock-id')).toBeInTheDocument();
    expect(screen.getByText('340 sek')).toBeInTheDocument();
  });
});

test('should toggle navigation menu when clicking icon', () => {
  render(
    <BrowserRouter>
      <Booking />
    </BrowserRouter>
  );

  const menuIcon = document.querySelector('.navigation__icon');
  fireEvent.click(menuIcon);

  const navigationLinks = screen.getAllByRole('link');
  navigationLinks.forEach((link) => {
    expect(link).not.toHaveClass('hide');
  });
});
