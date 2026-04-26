"use client";

import ErrorMessage from "../_components/errors/ErrorMessage";
import { IErrorProps } from "../_types/barbershop.interfaces";

export default function Error({ reset }: IErrorProps) {
  return (
    <section className="px-4">
      <ErrorMessage firstMessage={"Não foi possível carregar seu perfil."} />
      <p className="mt-4 text-center">Tente novamente em alguns instantes.</p>
      <div className="flex justify-center text-center mt-2">
        <button type="button" onClick={reset}>
          Tentar novamente
        </button>
      </div>
    </section>
  );
}
