import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import BookDetail from './BookDetail';

const createValidToken = () => {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 * 60 }));

  return `${header}.${payload}.signature`;
};

const renderBookDetail = (bookId = 'libro-1') => {
  render(
    <MemoryRouter initialEntries={[`/libros/${bookId}`]}>
      <Routes>
        <Route path="/" element={<h1>Inicio</h1>} />
        <Route path="/libros/:id" element={<BookDetail />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('BookDetail', () => {
  it('loads and displays a book from the mocked backend', async () => {
    renderBookDetail();

    expect(screen.getByText(/cargando detalle/i)).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /el nombre del viento/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/patrick rothfuss/i)).toBeInTheDocument();
    expect(screen.getByText(/12.5 eur/i)).toBeInTheDocument();
    expect(screen.getByText(/9788401025982/i)).toBeInTheDocument();
  });

  it('shows an error message when the book does not exist', async () => {
    renderBookDetail('libro-inexistente');

    expect(await screen.findByText(/no se pudo cargar el detalle/i)).toBeInTheDocument();
  });

  it('toggles wishlist and reservation actions for a logged user', async () => {
    const user = userEvent.setup();
    localStorage.setItem('token', createValidToken());

    renderBookDetail();

    expect(
      await screen.findByRole('heading', { name: /el nombre del viento/i }),
    ).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /en lista de deseos/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /en lista de deseos/i }));

    expect(await screen.findByRole('button', { name: /a.adir a lista/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /solicitar reserva/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reserva solicitada/i })).toBeDisabled();
    });
  });
});
