import { http, HttpResponse } from 'msw';

export const mockLibros = [
  {
    _id: 'libro-1',
    isbn: '9788401025982',
    title: 'El nombre del viento',
    authors: ['Patrick Rothfuss'],
    type: 'VENTA',
    precio: 12.5,
    estado: 'BUENO',
    imageUrl: 'https://example.com/libro-1.jpg',
  },
  {
    _id: 'libro-2',
    isbn: '9788497593793',
    title: 'Cien anos de soledad',
    authors: ['Gabriel Garcia Marquez'],
    type: 'ALQUILER',
    precio: 4,
    estado: 'NUEVO',
    imageUrl: 'https://example.com/libro-2.jpg',
  },
] as const;

export const mockMyBooks = {
  uploaded: [
    {
      _id: 'uploaded-1',
      isbn: '9780000000001',
      title: 'Libro subido de prueba',
      authors: ['Autora Local'],
      type: 'VENTA',
      precio: 9,
      estado: 'buen_estado',
    },
  ],
  bought: [
    {
      _id: 'bought-1',
      isbn: '9780000000002',
      title: 'Libro comprado de prueba',
      authors: ['Autor Compra'],
      type: 'VENTA',
      precio: 14,
      estado: 'NUEVO',
      owner: { _id: 'seller-1', name: 'Vendedor Uno' },
    },
  ],
  rented: [
    {
      _id: 'rented-1',
      isbn: '9780000000003',
      title: 'Libro alquilado de prueba',
      authors: ['Autora Alquiler'],
      type: 'ALQUILER',
      precio: 5,
      estado: 'BUENO',
      owner: { _id: 'seller-2', name: 'Vendedora Dos' },
      rentalStartDate: '2026-06-01T00:00:00.000Z',
      rentalEndDate: '2026-07-01T00:00:00.000Z',
    },
  ],
  wishlist: [
    {
      _id: 'wishlist-1',
      isbn: '9780000000004',
      title: 'Libro deseado de prueba',
      authors: ['Autor Deseado'],
      type: 'VENTA',
      precio: 20,
      estado: 'COMO_NUEVO',
    },
  ],
} as const;

export const mockRetos = [
  {
    _id: 'reto-1',
    title: 'Sube tu primer libro',
    description: 'Publica un libro en ViveBook.',
    type: 'SUBIR_LIBROS',
    progresoActual: 1,
    objetivo: 1,
    completado: true,
    fechaCompletado: '2026-06-10T00:00:00.000Z',
  },
  {
    _id: 'reto-2',
    title: 'Compra tres libros',
    description: 'Completa tres compras.',
    type: 'COMPRAR_LIBROS',
    progresoActual: 1,
    objetivo: 3,
    completado: false,
  },
  {
    _id: 'reto-3',
    title: 'Sigue a cinco lectores',
    description: 'Conecta con la comunidad.',
    type: 'SEGUIR_USUARIOS',
    progresoActual: 5,
    objetivo: 5,
    completado: true,
    fechaCompletado: '2026-06-12T00:00:00.000Z',
  },
] as const;

const mockUser = {
  _id: 'user-1',
  name: 'Usuario Test',
  email: 'test@vivebook.local',
  description: 'Biografia inicial de pruebas',
  rol: 'User',
  libros: [],
  boughtLibros: [],
  rentedLibros: [],
  favoriteAuthors: ['Patrick Rothfuss'],
  favoriteBooks: [{ _id: 'libro-2', title: 'Cien anos de soledad' }],
  favoriteCategories: ['Novela'],
  wishlist: [{ _id: 'libro-1', title: 'El nombre del viento' }],
  favoritos: ['libro-2'],
  eventos: [{ _id: 'evento-1', title: 'Club de lectura' }],
  followingUsers: [],
};

export const handlers = [
  http.get('*/auth/profile*', ({ request }) => {
    const url = new URL(request.url);
    if (!url.pathname.includes('/auth/profile/libros')) {
      return HttpResponse.json({
        success: true,
        data: mockUser,
      });
    }

    const category = (url.searchParams.get('category') || 'uploaded') as keyof typeof mockMyBooks;
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const libros = (mockMyBooks[category] || mockMyBooks.uploaded).filter((book) => {
      return (
        book.title.toLowerCase().includes(search) ||
        book.isbn.toLowerCase().includes(search) ||
        book.authors.join(', ').toLowerCase().includes(search)
      );
    });

    return HttpResponse.json({
      success: true,
      data: {
        libros,
        totalPages: 1,
        counts: {
          uploaded: mockMyBooks.uploaded.length,
          bought: mockMyBooks.bought.length,
          rented: mockMyBooks.rented.length,
          wishlist: mockMyBooks.wishlist.length,
        },
      },
    });
  }),

  http.get('*/libros', () => {
    return HttpResponse.json({
      success: true,
      data: mockLibros,
    });
  }),

  http.get('*/libros/search', ({ request }) => {
    const url = new URL(request.url);
    const term = url.searchParams.get('term')?.toLowerCase() || '';
    const libros = mockLibros.filter((libro) => libro.title.toLowerCase().includes(term));

    return HttpResponse.json({
      success: true,
      data: libros,
    });
  }),

  http.get('*/libros/:id', ({ params }) => {
    const libro = mockLibros.find((item) => item._id === params.id);

    if (!libro) {
      return HttpResponse.json({ success: false, message: 'Libro no encontrado' }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      data: libro,
    });
  }),

  http.post('*/auth/signin', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    if (body.email !== mockUser.email || body.password !== 'password123') {
      return HttpResponse.json(
        { success: false, message: 'Credenciales incorrectas' },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        token: 'mock-token',
        user: mockUser,
      },
    });
  }),

  http.get('*/usuarios/search', ({ request }) => {
    const url = new URL(request.url);
    const term = url.searchParams.get('term')?.toLowerCase() || '';
    const users = mockUser.name.toLowerCase().includes(term) ? [mockUser] : [];

    return HttpResponse.json({
      success: true,
      data: users,
    });
  }),

  http.put('*/usuarios/:userId', async ({ request, params }) => {
    if (params.userId !== mockUser._id) {
      return HttpResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 },
      );
    }

    const body = (await request.json()) as Partial<typeof mockUser>;
    Object.assign(mockUser, body);

    return HttpResponse.json({
      success: true,
      data: mockUser,
    });
  }),

  http.post('*/usuarios/wishlist/:libroId', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        libroId: params.libroId,
        inWishlist: true,
      },
    });
  }),

  http.post('*/usuarios/favoritos/:libroId', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        libroId: params.libroId,
        isFavorite: true,
      },
    });
  }),

  http.get('*/reservas/solicitadas', () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),

  http.post('*/reservas', async ({ request }) => {
    const body = (await request.json()) as { libroId?: string };

    return HttpResponse.json({
      success: true,
      data: {
        _id: 'reserva-1',
        libro: body.libroId,
        estado: 'PENDIENTE',
      },
    });
  }),

  http.post('*/message-requests', async ({ request }) => {
    const body = (await request.json()) as { bookId?: string; initialMessage?: string };

    return HttpResponse.json({
      success: true,
      data: {
        _id: 'message-request-1',
        bookId: body.bookId,
        initialMessage: body.initialMessage,
      },
    });
  }),

  http.get('*/retos/mis-retos', () => {
    return HttpResponse.json({
      success: true,
      data: mockRetos,
    });
  }),

  http.post('*/valoraciones', async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      success: true,
      data: {
        _id: 'valoracion-1',
        ...body,
      },
    });
  }),
];
