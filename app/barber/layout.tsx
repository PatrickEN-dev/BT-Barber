import { ReactNode } from "react";
import { requireBarber } from "./_utils/requireBarber";

const BarberLayout = async ({ children }: { children: ReactNode }) => {
  await requireBarber();
  return <div className="min-h-screen bg-background">{children}</div>;
};

export default BarberLayout;
