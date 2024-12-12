import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Booking from '../views/Booking';
import { BrowserRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Server setup
const server = setupServer(
  http.post('https://h5jbtjv6if.execute-api.eu-north-1.amazonaws.com', () => {
    return HttpResponse.json({
      booking: {
        id: 'mock-id',
        price: 340,
        when: '2024-12-24T14:00',
        lanes: 1,
        people: 2,
        shoes: ['42', '42'],
      },
    });
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

test('should show an error if the number of players exceeds available lanes', async () => {
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
    target: { value: 9 },
  });

  fireEvent.change(screen.getByLabelText(/Number of lanes/i), {
    target: { value: 2 },
  });

  for (let i = 0; i < 9; i++) {
    fireEvent.click(screen.getByText('+'));
  }

  const shoeInputs = document.querySelectorAll('.shoes__input');
  shoeInputs.forEach((input) => {
    fireEvent.change(input, { target: { value: '42' } });
  });

  fireEvent.click(screen.getByText(/strIIIIIike!/i));

  await waitFor(() =>
    expect(
      screen.getByText(/Det får max vara 4 spelare per bana/i)
    ).toBeInTheDocument()
  );
});

test('should complete booking and show confirmation', async () => {
  server.use(
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

  await waitFor(
    () => {
      const storedData = sessionStorage.getItem('confirmation');
      expect(storedData).toBeTruthy();
      const confirmation = JSON.parse(storedData);
      expect(confirmation.price).toBe(340);
    },
    { timeout: 3000 }
  );
});

test('should allow adding and removing shoe sizes', () => {
  render(
    <BrowserRouter>
      <Booking />
    </BrowserRouter>
  );

  fireEvent.click(screen.getByText('+'));
  let shoeInputs = document.querySelectorAll('.shoes__input');
  expect(shoeInputs.length).toBe(1);

  fireEvent.click(screen.getByText('-'));
  shoeInputs = document.querySelectorAll('.shoes__input');
  expect(shoeInputs.length).toBe(0);
});

test('should allow entering shoe sizes for multiple players', () => {
  render(
    <BrowserRouter>
      <Booking />
    </BrowserRouter>
  );

  fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), {
    target: { value: '3' },
  });

  for (let i = 0; i < 3; i++) {
    fireEvent.click(screen.getByText('+'));
  }

  const shoeInputs = document.querySelectorAll('.shoes__input');
  expect(shoeInputs.length).toBe(3);

  shoeInputs.forEach((input, index) => {
    fireEvent.change(input, { target: { value: `4${index}` } });
  });
});
