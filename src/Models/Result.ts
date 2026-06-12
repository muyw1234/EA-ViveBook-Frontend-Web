// Ligeramente inspirado en este tutorial https://youtu.be/XT3Aq-QYPdM?si=SjfR0Hoa56RryJfz
export default class Result<T> {
  success: boolean = false;
  status: number = 400;
  message: string = '';
  data?: T;
}
//No soy muy fan de poner las cabeceras en el body
