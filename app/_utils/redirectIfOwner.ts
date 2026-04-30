import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/_lib/auth";

export const redirectIfOwner = async () => {
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "OWNER") redirect("/admin");
};

export const requireCustomer = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");
  if (session.user.role === "OWNER") redirect("/admin");
};
