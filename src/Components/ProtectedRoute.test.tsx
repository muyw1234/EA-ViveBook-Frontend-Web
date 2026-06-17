import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ProtectedRoute from './ProtectedRoute';

const createValidToken = () => {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 * 60 }));

  return `${header}.${payload}.signature`;
};

const renderPrivateRoute = () => {
  render(
    <MemoryRouter initialEntries={['/my-books']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/my-books" element={<h1>Mis Libros</h1>} />
        </Route>
        <Route path="/login" element={<h1>Login</h1>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('ProtectedRoute', () => {
  it('redirects to login when there is no session token', () => {
    renderPrivateRoute();

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });

  it('renders the private route when there is a valid session token', () => {
    localStorage.setItem('token', createValidToken());

    renderPrivateRoute();

    expect(screen.getByRole('heading', { name: /mis libros/i })).toBeInTheDocument();
  });
});
