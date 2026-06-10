import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LibroService from '../Services/Libro';
import './BookDetail.css';

type Book = {
  _id?: string;
  id?: string;
  title?: string;
  authors?: string[];
  author?: string;
  isbn?: string;
  price?: string | number;
  status?: string;
  state?: string;
  description?: string;
  editorial?: string;
  publisher?: string;
  publicationDate?: string;
  publishedDate?: string;
};

const formatAuthors = (book: Book) => {
  if (book.authors?.length) {
    return book.authors.join(', ');
  }

  return book.author || 'Autor desconocido';
};

const formatPrice = (price?: string | number) => {
  if (price === undefined || price === null || price === '') {
    return 'Consultar precio';
  }

  return `${price} EUR`;
};

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setError('No se encontro el identificador del libro.');
        setLoading(false);
        return;
      }

      try {
        const data = await LibroService.getLibroById(id);
        setBook(data);
      } catch (fetchError) {
        console.error('Error fetching book detail:', fetchError);
        setError('No se pudo cargar el detalle del libro.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return <div className="book-detail-page">Cargando detalle del libro...</div>;
  }

  if (error || !book) {
    return (
      <div className="book-detail-page">
        <button className="back-button" onClick={() => navigate('/home')}>
          Volver
        </button>
        <p className="book-detail-error">{error || 'Libro no encontrado.'}</p>
      </div>
    );
  }

  return (
    <main className="book-detail-page">
      <button className="back-button" onClick={() => navigate('/home')}>
        Volver
      </button>

      <section className="book-detail-layout">
        <div className="book-detail-cover" aria-label="Portada del libro">
          <span>Libro</span>
        </div>

        <div className="book-detail-info">
          <span className="book-detail-status">{book.status || 'Disponible'}</span>
          <h1>{book.title || 'Titulo sin nombre'}</h1>
          <p className="book-detail-author">{formatAuthors(book)}</p>

          <div className="book-detail-price">{formatPrice(book.price)}</div>

          <dl className="book-detail-meta">
            <div>
              <dt>ISBN</dt>
              <dd>{book.isbn || 'No disponible'}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{book.state || 'No indicado'}</dd>
            </div>
            <div>
              <dt>Editorial</dt>
              <dd>{book.editorial || book.publisher || 'No indicada'}</dd>
            </div>
            <div>
              <dt>Publicacion</dt>
              <dd>{book.publicationDate || book.publishedDate || 'No indicada'}</dd>
            </div>
          </dl>

          {book.description && (
            <div className="book-detail-description">
              <h2>Descripcion</h2>
              <p>{book.description}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default BookDetail;
