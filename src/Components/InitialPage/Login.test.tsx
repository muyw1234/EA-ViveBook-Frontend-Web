import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Login from './Login';

const renderLogin = () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/" element={<h1>Inicio</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<h1>Registro</h1>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('Login', () => {
  it('logs in with valid credentials and navigates to home', async () => {
    const user = userEvent.setup();

    renderLogin();

    await user.type(screen.getByPlaceholderText(/laura@ejemplo.com/i), 'test@vivebook.local');
    await user.type(screen.getByPlaceholderText(/tu contrase/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByRole('heading', { name: /inicio/i })).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBe('mock-token');
  });

  it('shows an error message when credentials are invalid', async () => {
    const user = userEvent.setup();

    renderLogin();

    await user.type(screen.getByPlaceholderText(/laura@ejemplo.com/i), 'wrong@vivebook.local');
    await user.type(screen.getByPlaceholderText(/tu contrase/i), 'bad-password');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/email o contrase/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /entrar/i })).toBeEnabled();
  });
});
