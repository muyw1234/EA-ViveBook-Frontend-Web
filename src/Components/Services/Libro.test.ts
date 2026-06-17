import { describe, expect, it } from 'vitest';
import LibroService from './Libro';

describe('LibroService', () => {
  it('gets books from the mocked backend', async () => {
    const libros = await LibroService.getAllLibros();

    expect(libros).toHaveLength(2);
    expect(libros[0]).toMatchObject({
      _id: 'libro-1',
      title: 'El nombre del viento',
      authors: ['Patrick Rothfuss'],
      precio: 12.5,
    });
  });

  it('gets one book by id from the mocked backend', async () => {
    const libro = await LibroService.getLibroById('libro-2');

    expect(libro).toMatchObject({
      _id: 'libro-2',
      title: 'Cien anos de soledad',
      type: 'ALQUILER',
    });
  });
});
