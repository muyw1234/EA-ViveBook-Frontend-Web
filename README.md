# Mínim 2: Llista de Desitjos (Wishlist), Favorits i Paginació de Biblioteca

**Autor:** Marc (Grup G3)
**Tasca:** Implementar la llista de desitjos (wishlist), la llista de preferits (favorites) de llibres, i optimitzar la biblioteca mitjançant paginació al backend.

## Abast de l'exercici

Aquest document descriu l'abast i l'estat de la implementació de les funcionalitats desenvolupades per al Mínim 2.

## Estat de l'exercici

Completat / Operatiu. L'exercici ha passat de la fase "in progress" a estar finalitzat.

## Parts operatives (Finalitzades)

S'han codificat i provat les següents funcionalitats:

- **Definició de la història d'usuari:** Història amb descripció en GHERKIN i les tasques principals a la targeta de seguiment.
- **Branca Git de treball:** Desenvolupament i proves organitzades completament sota la branca `minim2/marc`.
- **Model de dades:** Adaptació de l'esquema de l'usuari a MongoDB per emmagatzemar referències d'ObjectIds cap al model `Libro`.
- **Lògica del Backend:**
  - Endpoints per afegir, consultar i eliminar llibres de la llista de desitjos (`POST /usuarios/wishlist/:libroId`) i favorits (`POST /usuarios/favoritos/:libroId`).
  - Nou endpoint paginat `/auth/profile/libros` que rep paràmetres de cerca `category`, `page` i `limit` per processar la paginació des de la base de dades i obtenir els contadors totals de cada secció de forma eficient.
- **Integració i Millores al Frontend:**
  - Botó interactiu per afegir/eliminar llibres a la llista de desitjos i a preferits directament a la vista de detalls del llibre (`BookDetail.tsx`).
  - Secció del perfil d'usuari (`Profile.tsx`) que mostra els favorits en forma de chips estètics grocs (amb enllaços clicables i botó de supressió en mode edició).
  - Redisseny de la biblioteca personal (`MyBooks.tsx`) per connectar-se al servei de paginació del backend. S'elimina el filtratge local com `.slice()`, optimitzant la càrrega de dades i actualitzant de forma dinàmica les pestanyes (Pujats, Comprats, Llogats i Llista de desitjos) amb els comptadors retornats per l'API.

## Parts pendents de codificar

- Cap. Totes les funcionalitats requerides per al Mínim 2 estan codificades i operatives.

## Ús de la Intel·ligència Artificial (IA)

S'ha utilitzat una eina de suport d'Intel·ligència Artificial (IA) durant el desenvolupament de l'exercici, posant el focus de forma molt predominant en les tasques del **frontend**:

- **Desenvolupament al Frontend (Major enfocament):**
  - Implementació de la lògica de presentació dinàmica dels botons de favorits i llista de desitjos en el detall de llibre (`BookDetail.tsx`).
  - Refactorització completa del component de biblioteca (`MyBooks.tsx`) per connectar-lo al servei de paginació del backend, eliminant el filtratge i tallat local (`.slice()`) que es feia anteriorment.
  - Resolució d'errors de compilació i definició d'interfícies en TypeScript.
- **Desenvolupament al Backend:**
  - Suport en el disseny i implementació del nou endpoint paginat de perfil/llibres (`/auth/profile/libros`) i l'endpoint per fer toggle de preferits.
