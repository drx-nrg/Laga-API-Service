import { ZodError } from "zod";

interface ErrorFormatted {
  [key: string]: string;
}

export const errorFormatter = (err: ZodError): ErrorFormatted => {
  const { issues } = err;
  const errors: ErrorFormatted = {};

  issues.map((el) => {
    errors[el.path[0]] = el.message;
  });

  return errors;
};
