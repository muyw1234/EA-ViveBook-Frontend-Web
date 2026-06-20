export default interface IReto {
  _id: string;
  title: string;
  description?: string;
  type: string;
  progresoActual: number;
  objetivo: number;
  completado: boolean;
  fechaCompletado?: string;
}
