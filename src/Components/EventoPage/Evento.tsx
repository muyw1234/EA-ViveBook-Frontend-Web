import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
//import { eventoService } from "../../services/eventoService";
import { useTranslation } from "react-i18next";
import "./Evento.css";

const Evento: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  

return (
    <div className="evento-container">
      {loading ? (<p>{t("loading")}</p>) : (
        <div>
          <h2>{evento?.nombre}</h2>
          <p>{evento?.descripcion}</p>
        </div>
      )}
    </div>
  );
}



export default Evento;