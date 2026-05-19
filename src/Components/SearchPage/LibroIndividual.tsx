import React from "react";
import type ILibro from "../../Models/Libro";

/**
 * Una entrada de resultado de libro
 */

export interface Props{
    libro: Partial<ILibro>;
}

export default function LibroIndividual(props: Props){

    return(
        // <div className="row">
        //     <div className="col">{props.libro.isbn}</div>
        //     <div className="col">{props.libro.title}</div>
        //     <div className="col">{props.libro.type}</div>
        //     <div className="col">{props.libro.estado}</div>
        //     <div className="col">{props.libro.precio}</div>
        // </div>
        <div className='card bg-dark text-white'>
          <div className='card-body'>
            <h4 className='card-title'>{props.libro.title}</h4>
            <p className='card-text'>Isbn: {props.libro.isbn}, Precio: {props.libro.precio}€ {/*Seria interesante poner otras monedas, no?*/}, Estado: {props.libro.estado}</p>
            <a href='#' className='btn-primary' onClick={() => console.log('Hello world!')}>Detalles</a>
          </div>
        </div>
    );
}