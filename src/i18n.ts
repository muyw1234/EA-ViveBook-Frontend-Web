// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      "loading": "Cargando ViveBook...",
      "add_book_btn": "Añadir Libro",
      "login_btn": "Iniciar Sesión",
      "search_placeholder": "Busca libros, autores o librerías...",
      "hero_title_line1": "Tu próxima historia",
      "hero_title_line2": "te está esperando.",
      "hero_subtitle": "Alquila, comparte y vive la lectura en tu comunidad.",
      "section_posts": "Posts",
      "section_rentals": "Libros en Alquiler",
      "section_sales": "Libros a la Venta",
      "section_events": "Eventos Destacados",
      "see_all": "Ver todos",
      "no_rentals_available": "No hay libros de alquiler disponibles en este momento.",
      "no_sales_available": "No hay libros a la venta disponibles en este momento.",
      "consult_price": "Consultar precio",
      "unknown_author": "Autor Desconocido",
      "modal_add_title": "Añadir un Libro",
      "use_open_library": "Usar OpenLibrary",
      "label_operation_type": "Tipo de Operación",
      "for_sale": "Para Vender",
      "for_rent": "Para Alquilar",
      "label_id_data": "Datos de identificación",
      "label_book_title": "Título del libro",
      "label_author": "Autor",
      "label_book_state": "Estado del libro",
      "label_price": "Precio (€)",
      "state_new": "Nuevo",
      "state_like_new": "Como nuevo",
      "state_good": "Buen estado",
      "state_used": "Usado con marcas",
      "submit_book_btn": "Subir Libro",
      "alert_book_added_success": "Libro añadido con éxito",
      "alert_book_added_error": "Error al añadir el libro. Revisa la consola.",


      // Accessibility menu translations
      "accessibility_settings": "Configuración de Accesibilidad",
      "contrast": "Contraste",
      "language": "Idioma",
    }
  },
  cat: {
    translation: {
      "loading": "Carregant ViveBook...",
      "add_book_btn": "Afegir Llibre",
      "login_btn": "Iniciar Sessió",
      "search_placeholder": "Cerca llibres, autors o llibreries...",
      "hero_title_line1": "La teva propera història",
      "hero_title_line2": "t'està esperant.",
      "hero_subtitle": "Lloga, comparteix i viu la lectura a la teva comunitat.",
      "section_posts": "Posts",
      "section_rentals": "Llibres en Lloguer",
      "section_sales": "Llibres a la Venda",
      "section_events": "Esdeveniments Destacats",
      "see_all": "Veure'ls tots",
      "no_rentals_available": "No hi ha llibres de lloguer disponibles en aquest moment.",
      "no_sales_available": "No hi ha llibres a la venda disponibles en aquest moment.",
      "consult_price": "Consultar preu",
      "unknown_author": "Autor Desconegut",
      "modal_add_title": "Afegir un Llibre",
      "use_open_library": "Utilitzar OpenLibrary",
      "label_operation_type": "Tipus d'Operació",
      "for_sale": "Per Vendre",
      "for_rent": "Per Llogar",
      "label_id_data": "Dades d'identificació",
      "label_book_title": "Títol del llibre",
      "label_author": "Autor",
      "label_book_state": "Estat del llibre",
      "label_price": "Preu (€)",
      "state_new": "Nou",
      "state_like_new": "Com a nou",
      "state_good": "Bon estat",
      "state_used": "Usat amb marques",
      "submit_book_btn": "Penjar Llibre",
      "alert_book_added_success": "Llibre afegit amb èxit",
      "alert_book_added_error": "Error en afegir el llibre. Revisa la consola.",


      // Accessibility menu translations
      "accessibility_settings": "Configuració d'Accessibilitat",
      "contrast": "Contrast",
      "language": "Idioma",
    }
  },
  en: {
    translation: {
      "loading": "Loading ViveBook...",
      "add_book_btn": "Add Book",
      "login_btn": "Log In",
      "search_placeholder": "Search books, authors or bookstores...",
      "hero_title_line1": "Your next story",
      "hero_title_line2": "is waiting for you.",
      "hero_subtitle": "Rent, share and experience reading in your community.",
      "section_posts": "Posts",
      "section_rentals": "Books for Rent",
      "section_sales": "Books for Sale",
      "section_events": "Featured Events",
      "see_all": "See all",
      "no_rentals_available": "There are no books for rent available at this time.",
      "no_sales_available": "There are no books for sale available at this time.",
      "consult_price": "Check price",
      "unknown_author": "Unknown Author",
      "modal_add_title": "Add a Book",
      "use_open_library": "Use OpenLibrary",
      "label_operation_type": "Operation Type",
      "for_sale": "For Sale",
      "for_rent": "For Rent",
      "label_id_data": "Identification details",
      "label_book_title": "Book title",
      "label_author": "Author",
      "label_book_state": "Book condition",
      "label_price": "Price (€)",
      "state_new": "New",
      "state_like_new": "Like new",
      "state_good": "Good condition",
      "state_used": "Used with marks",
      "submit_book_btn": "Upload Book",
      "alert_book_added_success": "Book added successfully",
      "alert_book_added_error": "Error adding book. Check the console.",


      // Accessibility menu translations
      "accessibility_settings": "Accessibility Settings",
      "contrast": "Contrast",
      "language": "Language",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // Default language
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;