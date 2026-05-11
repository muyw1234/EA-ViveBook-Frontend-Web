import type { AxiosResponse } from "axios";
import api from "../../api";
import type { Dispatch, SetStateAction } from "react";



export interface IPost {
    _id: string
    description: string;
    status: string; //PostStatus; // nunca he probado a hacer un enum en typescript
    imageUrl?: string; // opcional, si no sube nada entonces le ponemos un imagen default
    IsDeleted?: boolean;
    ownerId: string;
    bookId: string;
}

// Programacion reactiva
async function readAllPosts(setter: Dispatch<SetStateAction<Partial<IPost>[]>>) {
    api.get('/posts/')
      .then((response) => {
        setter(response.data);
      })
      .catch((error) => console.log(error));
}

export default {readAllPosts};