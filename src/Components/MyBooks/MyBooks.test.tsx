import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import BookDetail from '../BookDetail/BookDetail';
import MyBooks from './MyBooks';

const createValidToken = () => {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 * 60 }));

  return `${header}.${payload}.signature`;
};

const renderMyBooks = () => {
  localStorage.setItem('token', createValidToken());

  render(
    <MemoryRouter initialEntries={['/my-books']}>
      <Routes>
        <Route path="/my-books" element={<MyBooks />} />
        <Route path="/libros/:id" element={<BookDetail />} />
        <Route path="/home" element={<h1>Inicio</h1>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('MyBooks', () => {
  it('loads the personal library with counters and uploaded books', async () => {
    renderMyBooks();

    expect(screen.getByText(/cargando tu biblioteca/i)).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /mi biblioteca/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subidos \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /comprados \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /alquilados \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lista de deseos \(1\)/i })).toBeInTheDocument();
    expect(screen.getByText(/libro subido de prueba/i)).toBeInTheDocument();
  });

  it('filters the current tab by search text', async () => {
    const user = userEvent.setup();

    renderMyBooks();

    const searchInput = await screen.findByPlaceholderText(/buscar por/i);
    await user.type(searchInput, 'no-existe');

    await waitFor(() => {
      expect(screen.queryByText(/libro subido de prueba/i)).not.toBeInTheDocument();
    });
    expect(screen.getByText(/no hay libros en esta categor/i)).toBeInTheDocument();
  });

  it('opens wishlist tab and navigates to a desired book detail', async () => {
    const user = userEvent.setup();

    renderMyBooks();

    await user.click(await screen.findByRole('button', { name: /lista de deseos \(1\)/i }));
    expect(await screen.findByText(/libro deseado de prueba/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /ver detalle/i }));

    expect(await screen.findByText(/no se pudo cargar el detalle/i)).toBeInTheDocument();
  });
});
