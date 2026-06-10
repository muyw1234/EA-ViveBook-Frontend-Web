import type { JSX } from 'react';
import type ILibro from '../../Models/Libro';

/**
 * Una entrada de resultado de libro
 */

export interface Props {
  libro: Partial<ILibro>;
}

export default function LibroIndividual(props: Props) {
  //#region Conditional rendering
  let imagen: JSX.Element = <div className="card-img-top">No hay imagen.</div>;
  if (props.libro.imageUrl)
    imagen = <img className="card-img-top" src={props.libro.imageUrl} alt="Card image" />;
  //#endregion

  return (
    // <div className="row">
    //     <div className="col">{props.libro.isbn}</div>
    //     <div className="col">{props.libro.title}</div>
    //     <div className="col">{props.libro.type}</div>
    //     <div className="col">{props.libro.estado}</div>
    //     <div className="col">{props.libro.precio}</div>
    // </div>
    <div className="card m-3">
      <div className="card-header">
        <h4 className="card-title">{props.libro.title}</h4>
      </div>
      {imagen}
      <div className="card-body">
        <p className="card-text">
          Isbn: {props.libro.isbn}, Precio: {props.libro.precio}€{' '}
          {/*Seria interesante poner otras monedas, no?*/}, Estado: {props.libro.estado}
        </p>
        <a href="#" className="btn-primary" onClick={() => console.log('Hello world!')}>
          Detalles
        </a>
      </div>
    </div>
  );
}
