import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LibroService from "../Services/Libro";
import EventService from "../Services/Evento";
//import PostService from "../Services/Post";

const CategoryPage: React.FC = () => {
    const { type } = useParams();
    const navigate = useNavigate();

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                if (type === "rentals") {
                    const books = await LibroService.getAllLibros();
                    console.log("Libros recibidos:", books); // Mira en la consola del navegador
                    console.log("Tipo de categoría:", type);

                    setItems(
                        books.filter((b: any) => b.type === "ALQUILER")
                    );
                }

                else if (type === "sales") {
                    const books = await LibroService.getAllLibros();

                    setItems(
                        books.filter((b: any) => b.type === "VENTA")
                    );
                }

                else if (type === "events") {
                    const events = await EventService.getAllEventos();
                    setItems(events || []);
                }

                /*else if (type === "posts") {
                    const postsData: any[] = [];

                    await PostService.readAllPosts((data: any[]) => {
                        postsData.push(...data);
                    });

                    setItems(postsData);
                }
            */
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    const openBookDetail = (bookId?: string) => {
        if (bookId) {
        navigate(`/libros/${bookId}`);
        }
    };

    return (
        <div className="home-container">
            <h1 style={{ marginBottom: "2rem" }}>
                {type === "rentals" && "Libros en alquiler"}
                {type === "sales" && "Libros en venta"}
                {type === "events" && "Eventos"}
                {type === "posts" && "Posts"}
            </h1>

            <div className="card-grid">
                {items.map((item: any) => (
                    <div
                        key={item._id}
                        className="book-card"
                        onClick={() => {
                            if (type === "events") {
                                navigate(`/eventos/${item._id}`);
                            } else {
                                navigate(`/libros/${item._id}`);
                            }
                        }}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="card-image-placeholder">
                            📚
                        </div>

                        <div className="card-info">
                            <span className="card-title">
                                {item.title || item.description}
                            </span>

                            {item.price && (
                                <span className="card-meta">
                                    {item.price} €
                                </span>
                            )}

                            {item.date && (
                                <span className="card-meta">
                                    {new Date(item.date).toLocaleDateString()}
                                </span>
                            )}

                            {item.estado && (
                                <span className="card-meta">
                                    {item.estado}
                                </span>
                            )}

                            {item.authors && (
                                <span className="card-meta">
                                    {item.authors.join(", ")}
                                </span>
                            )}

                            {item.direccionExacta && (
                                <span className="card-meta">
                                    {item.direccionExacta}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryPage;