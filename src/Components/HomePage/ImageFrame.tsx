import React from 'react';

// Lo mejor seria utilizar el principio de Interface Segregation para declarar que todas las clases que tienen url de imagenes derivan de un IImage, pero no tenemos todos los modelos en el frontend y ademas, en el backend no lo hemos hecho asi.
export default function ImageFrame(props: {imageUrl: string | undefined}) {

    if(props.imageUrl) 
        return <img src={props.imageUrl} height="255px" width="512px"></img>;
    else 
        return <span className="placeholder-text">Imagen no disponible</span>; //Tambien podria ser un icono de imagen no encontrado
}