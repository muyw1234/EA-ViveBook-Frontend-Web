import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { useEffect } from "react";

export default function ProtectedRoute() {
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            toast.warn("Debes iniciar sesión para acceder a esta sección");
        }
    }, [token]);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
