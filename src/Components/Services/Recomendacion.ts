import api from "../../api";

export interface RecommendationContextItem {
    title?: string;
    text: string;
}

export interface RecommendationResult {
    query: string;
    respuesta: string;
    context: RecommendationContextItem[];
    metadata: {
        model: string;
        contextSource: "request" | "mongodb";
        totalContextItems: number;
    };
}

const recomendarLibros = async (query: string, limit: number = 5): Promise<RecommendationResult> => {
    const response = await api.post("/recomendaciones", {
        query,
        limit,
        includeDeleted: false
    });

    return response.data;
};

const healthCheck = async () => {
    const response = await api.get("/recomendaciones/health");
    return response.data;
};

export default {
    recomendarLibros,
    healthCheck
};
