import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import BookDetail from '../BookDetail/BookDetail';
import SearchPage from './searchPage';

const renderSearchPage = (initialState?: Record<string, unknown>) => {
  render(
    <MemoryRouter initialEntries={[{ pathname: '/search', state: initialState }]}>
      <Routes>
        <Route path="/search" element={<SearchPage />} />
        <Route path="/libros/:id" element={<BookDetail />} />
        <Route path="/profile/:userId" element={<h1>Perfil de usuario</h1>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('SearchPage', () => {
  it('loads all books when opened without a search term', async () => {
    renderSearchPage();

    expect(await screen.findByText(/el nombre del viento/i)).toBeInTheDocument();
    expect(screen.getByText(/cien anos de soledad/i)).toBeInTheDocument();
  });

  it('searches books and users using the mocked backend', async () => {
    const user = userEvent.setup();

    renderSearchPage();

    const searchInput = await screen.findByPlaceholderText(/busca libros/i);
    await user.clear(searchInput);
    await user.type(searchInput, 'Usuario');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(await screen.findByText(/usuario test/i)).toBeInTheDocument();
    expect(screen.getByText(/test@vivebook.local/i)).toBeInTheDocument();
    expect(screen.getByText(/no se encontraron libros/i)).toBeInTheDocument();
  });

  it('filters results by type and navigates to the selected book detail', async () => {
    const user = userEvent.setup();

    renderSearchPage({ openFilters: true });

    expect(await screen.findByText(/el nombre del viento/i)).toBeInTheDocument();
    expect(screen.getByText(/cien anos de soledad/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /alquiler/i }));

    expect(screen.queryByText(/el nombre del viento/i)).not.toBeInTheDocument();
    const rentalBook = screen.getByText(/cien anos de soledad/i);
    expect(rentalBook).toBeInTheDocument();

    await user.click(rentalBook.closest('.book-card') as HTMLElement);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /cien anos de soledad/i })).toBeInTheDocument();
    });
  });
});
