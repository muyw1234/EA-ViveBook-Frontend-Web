import type IReto from "../Models/Reto";

export interface UserLevelInfo {
    levelName: "Oro" | "Plata" | "Bronce" | "Sin nivel";
    medal: "🥇" | "🥈" | "🥉" | "";
    completedCount: number;
    totalCount: number;
}

export const calculateUserLevel = (retos: IReto[]): UserLevelInfo => {
    if (!retos || retos.length === 0) {
        return {
            levelName: "Sin nivel",
            medal: "",
            completedCount: 0,
            totalCount: 0
        };
    }

    const totalCount = retos.length;
    const completedCount = retos.filter(r => r.completado).length;

    if (completedCount === totalCount && totalCount > 0) {
        return {
            levelName: "Oro",
            medal: "🥇",
            completedCount,
            totalCount
        };
    }

    if (completedCount >= totalCount / 2) {
        return {
            levelName: "Plata",
            medal: "🥈",
            completedCount,
            totalCount
        };
    }

    if (completedCount >= 3) {
        return {
            levelName: "Bronce",
            medal: "🥉",
            completedCount,
            totalCount
        };
    }

    return {
        levelName: "Sin nivel",
        medal: "",
        completedCount,
        totalCount
    };
};
