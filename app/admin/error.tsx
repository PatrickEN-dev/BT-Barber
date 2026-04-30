"use client";

import ErrorMessage from "../_components/errors/ErrorMessage";
import { IErrorProps } from "../_types/barbershop.interfaces";

export default function Error({ reset }: IErrorProps) {
  return (
    <section className="px-5 py-10">
      <ErrorMessage firstMessage="Não foi possível carregar o painel." />
      <div className="flex justify-center mt-3">
        <button type="button" onClick={reset} className="text-sm text-primary underline">
          Tentar novamente
        </button>
      </div>
    </section>
  );
}
