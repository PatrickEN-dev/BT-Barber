import { Card, CardContent } from "@/app/_components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface IProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState = ({ icon: Icon, title, description, action }: IProps) => (
  <Card>
    <CardContent className="py-10 px-5 flex flex-col items-center text-center gap-2">
      {Icon && <Icon size={28} className="text-gray-500" />}
      <h3 className="text-sm font-semibold mt-1">{title}</h3>
      {description && <p className="text-xs text-gray-400 max-w-xs">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </CardContent>
  </Card>
);

export default EmptyState;
