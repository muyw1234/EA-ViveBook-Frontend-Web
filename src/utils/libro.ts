import type ILibro from '../Models/Libro';
import { getApiCollection, unwrapApiData } from './apiResponse';

type RawAuthor =
  | string
  | {
      _id?: string;
      fullName?: string;
      name?: string;
    };

type RawLibro = Omit<Partial<ILibro>, 'authors'> & {
  authors?: RawAuthor[];
  author?: string;
  coverUrl?: string;
  image?: string;
  imagen?: string;
  portada?: string;
  price?: string | number;
  state?: string;
  status?: string;
  [key: string]: unknown;
};

const toNumber = (value: unknown): number | undefined => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

export const getAuthorNames = (authors?: RawAuthor[], fallback?: string): string[] => {
  const names = (authors || [])
    .map((author) => {
      if (typeof author === 'string') {
        return author;
      }

      return author.fullName || author.name || '';
    })
    .filter((name): name is string => Boolean(name));

  if (names.length > 0) {
    return names;
  }

  return fallback ? [fallback] : [];
};

export const formatAuthors = (
  authors?: RawAuthor[],
  fallback?: string,
  emptyLabel = 'Autor desconocido',
): string => getAuthorNames(authors, fallback).join(', ') || emptyLabel;

export const normalizeLibro = (payload: unknown): ILibro => {
  const raw = unwrapApiData<RawLibro>(payload);

  return {
    ...raw,
    _id: String(raw?._id || ''),
    isbn: String(raw?.isbn || ''),
    title: String(raw?.title || ''),
    authors: getAuthorNames(raw?.authors, raw?.autor || raw?.author),
    type: raw?.type === 'ALQUILER' ? 'ALQUILER' : 'VENTA',
    precio: toNumber(raw?.precio ?? raw?.price) ?? 0,
    estado: String(raw?.estado || raw?.state || raw?.status || ''),
    imageUrl: String(
      raw?.imageUrl || raw?.imagen || raw?.image || raw?.coverUrl || raw?.portada || '',
    ),
  };
};

export const normalizeLibros = (payload: unknown): ILibro[] =>
  getApiCollection<RawLibro>(payload).map(normalizeLibro);
