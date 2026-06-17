import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Retos from './Retos';

const renderRetos = () => {
  render(
    <MemoryRouter>
      <Retos />
    </MemoryRouter>,
  );
};

describe('Retos', () => {
  it('loads progress summary and challenge cards', async () => {
    renderRetos();

    expect(screen.getByText(/cargando tus retos/i)).toBeInTheDocument();
    expect(await screen.findByText(/nivel actual/i)).toBeInTheDocument();
    expect(screen.getByText(/plata/i)).toBeInTheDocument();
    const completedLabel = screen.getAllByText(/completados/i).find((element) => {
      return element.className === 'stat-label';
    });
    expect(within(completedLabel!.parentElement!).getByText('2')).toBeInTheDocument();
    expect(
      within(screen.getByText(/retos totales/i).parentElement!).getByText('3'),
    ).toBeInTheDocument();
    expect(screen.getByText(/sube tu primer libro/i)).toBeInTheDocument();
    expect(screen.getByText(/compra tres libros/i)).toBeInTheDocument();
    expect(screen.getByText(/sigue a cinco lectores/i)).toBeInTheDocument();
  });

  it('filters completed and pending challenges', async () => {
    const user = userEvent.setup();

    renderRetos();

    expect(await screen.findByText(/compra tres libros/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /completados/i }));

    expect(screen.getByText(/sube tu primer libro/i)).toBeInTheDocument();
    expect(screen.getByText(/sigue a cinco lectores/i)).toBeInTheDocument();
    expect(screen.queryByText(/compra tres libros/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /pendientes/i }));

    expect(screen.getByText(/compra tres libros/i)).toBeInTheDocument();
    expect(screen.queryByText(/sube tu primer libro/i)).not.toBeInTheDocument();
  });
});
