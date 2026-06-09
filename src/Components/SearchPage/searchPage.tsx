import { useEffect, useState, type JSX } from "react";
import type ILibro from "../../Models/Libro";
import LibroIndividual from "./LibroIndividual";
import Libro from "../Services/Libro";
import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// export interface Props {
//   resultado: ILibro[];
// }

export default function SearchPage(/*props: Props*/) {
  // const buffer = props.resultado.map((res)=>{
  //     return <LibroIndividual libro={res} />
  // })

  const [buffer, setBuffer] = useState<JSX.Element[]>([<h2>Nothing have been found</h2>]);
  // const params = useParams();
  const location = useLocation();
  /* let buffer: JSX.Element[] = []; */
  

  useEffect(() => {
    async function fetchData() {
      const data = await Libro.searchLibro(location.state.term as string);
      if(data.data.length !== 0) setBuffer(data.data.map((res : Partial<ILibro>) => {
        console.log(`Rendering: ${JSON.stringify(res)}`);
        return <LibroIndividual libro={res} />;
      })); 
    }
    fetchData(); 
  }, []);

  return (
    <div className="container">
      <div className="g-3 p-3">{buffer}</div>
      <ToastContainer />
    </div>
  );
}
