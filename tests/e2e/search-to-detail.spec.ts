import { expect, test } from '@playwright/test';

const books = [
  {
    _id: 'libro-1',
    isbn: '9788401025982',
    title: 'El nombre del viento',
    authors: ['Patrick Rothfuss'],
    type: 'VENTA',
    precio: 12.5,
    estado: 'BUENO',
    imageUrl: null,
  },
  {
    _id: 'libro-2',
    isbn: '9788497593793',
    title: 'Cien anos de soledad',
    authors: ['Gabriel Garcia Marquez'],
    type: 'ALQUILER',
    precio: 4,
    estado: 'NUEVO',
    imageUrl: null,
  },
];

test.beforeEach(async ({ page }) => {
  await page.route('**/libros**', async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname.endsWith('/libros/search')) {
      const term = url.searchParams.get('term')?.toLowerCase() || '';
      const data = books.filter((book) => book.title.toLowerCase().includes(term));

      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data }),
      });
      return;
    }

    if (url.pathname.endsWith('/libros')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: books }),
      });
      return;
    }

    const id = url.pathname.split('/').pop();
    const book = books.find((item) => item._id === id);

    if (!book) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Libro no encontrado' }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: book }),
    });
  });

  await page.route('**/usuarios/search**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });
});

test('searches a book and opens its detail page', async ({ page }) => {
  await page.goto('/search');

  await expect(page.getByRole('heading', { name: /buscador/i })).toBeVisible();
  await expect(page.getByText(/el nombre del viento/i)).toBeVisible();

  await page.getByPlaceholder(/busca libros/i).fill('Cien');
  await page.getByRole('button', { name: /buscar/i }).click();

  await expect(page.getByText(/cien anos de soledad/i)).toBeVisible();
  await expect(page.getByText(/el nombre del viento/i)).toHaveCount(0);

  await page.getByText(/cien anos de soledad/i).click();

  await expect(page).toHaveURL(/\/libros\/libro-2$/);
  await expect(page.getByRole('heading', { name: /cien anos de soledad/i })).toBeVisible();
  await expect(page.getByText(/gabriel garcia marquez/i)).toBeVisible();
  await expect(page.getByText(/9788497593793/i)).toBeVisible();
});
