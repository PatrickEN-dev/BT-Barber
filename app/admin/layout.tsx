import { ReactNode } from "react";
import { requireOwner } from "./_utils/requireOwner";

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  await requireOwner();
  return <div className="min-h-screen bg-background">{children}</div>;
};

export default AdminLayout;
