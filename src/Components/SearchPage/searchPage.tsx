import React, { useEffect, useState } from "react";
import type { ILibro } from "../../Models/Libro";
import LibroIndividual from "./LibroIndividual";
import Libro from "../Services/Libro";
import type { AxiosResponse } from "axios";
import { useLocation, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// export interface Props {
//   resultado: ILibro[];
// }

export default function SearchPage(/*props: Props*/) {
  // const buffer = props.resultado.map((res)=>{
  //     return <LibroIndividual libro={res} />
  // })

  const [results, setResults] = useState<Partial<ILibro>[]>([]);
  // const params = useParams();
  const location = useLocation();

  useEffect(() => {
    // No se porque hace dos peticiones
    Libro.searchLibro(location.state.term as string, setResults);
  }, []);

  let buffer = results.map((res) => {
    return <LibroIndividual libro={res} />;
  });

  if (results.length === 0) buffer = <h2>Nothing have been found</h2>;

  return (
    <div className="container">
      <div className="g-3">{buffer}</div>
      <ToastContainer />
    </div>
  );
}
