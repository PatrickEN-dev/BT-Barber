"use server";

import { db } from "../_lib/prisma";

export const findAllBarbershops = async (term?: string) => {
  return term
    ? db.barbershop.findMany({
        where: {
          name: {
            contains: term,
            mode: "insensitive",
          },
        },
      })
    : db.barbershop.findMany({});
};
