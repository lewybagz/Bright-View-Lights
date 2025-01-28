import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Briefcase,
  ShieldHalf,
  MapPinned,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Teams", href: "/teams", icon: ShieldHalf },
  { name: "Team Members", href: "/team-members", icon: Users },
  { name: "Service Area", href: "/service-area", icon: MapPinned },
];

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      <Link to="/dashboard" className="flex h-14 items-center px-4">
        <span className="text-lg font-bold text-brightview-orange">
          BrightView
        </span>
      </Link>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
