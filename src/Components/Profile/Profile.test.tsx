import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import BookDetail from '../BookDetail/BookDetail';
import EventoDetail from '../EventoDetail/EventoDetail';
import Profile from './Profile';

const createValidToken = () => {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 * 60 }));

  return `${header}.${payload}.signature`;
};

const renderProfile = () => {
  localStorage.setItem('token', createValidToken());

  render(
    <MemoryRouter initialEntries={['/profile']}>
      <Routes>
        <Route path="/" element={<h1>Inicio</h1>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/libros/:id" element={<BookDetail />} />
        <Route path="/eventos/:id" element={<EventoDetail />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('Profile', () => {
  it('loads the current user profile with preferences, wishlist and followed events', async () => {
    renderProfile();

    expect(screen.getByText(/cargando informaci/i)).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /usuario test/i })).toBeInTheDocument();
    expect(screen.getByText(/test@vivebook.local/i)).toBeInTheDocument();
    expect(screen.getByText(/biografia inicial de pruebas/i)).toBeInTheDocument();
    expect(screen.getByText(/patrick rothfuss/i)).toBeInTheDocument();
    expect(screen.getByText(/cien anos de soledad/i)).toBeInTheDocument();
    expect(screen.getByText(/novela/i)).toBeInTheDocument();
    expect(screen.getByText(/el nombre del viento/i)).toBeInTheDocument();
    expect(screen.getByText(/club de lectura/i)).toBeInTheDocument();
    expect(screen.getByText(/plata/i)).toBeInTheDocument();
  });

  it('allows editing and saving basic profile information', async () => {
    const user = userEvent.setup();

    renderProfile();

    await user.click(await screen.findByRole('button', { name: /editar perfil/i }));

    const nameInput = screen.getByDisplayValue('Usuario Test');
    const descriptionInput = screen.getByDisplayValue('Biografia inicial de pruebas');

    await user.clear(nameInput);
    await user.type(nameInput, 'Usuario Editado');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Nueva biografia desde test');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /usuario editado/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/nueva biografia desde test/i)).toBeInTheDocument();
  });

  it('logs out and navigates to home', async () => {
    const user = userEvent.setup();

    renderProfile();

    await user.click(await screen.findByRole('button', { name: /cerrar sesi/i }));

    expect(await screen.findByRole('heading', { name: /inicio/i })).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
