export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  errorCode: string;
  errors?: { [key: string]: string[] }
}