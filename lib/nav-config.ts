import {
  LayoutDashboard,
  Users,
  School,
  GraduationCap,
  CalendarCheck,
} from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  roles: string[];
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: [
      "school_admin",
      "principal",
      "teacher",
      "accountant",
      "receptionist",
      "student",
      "parent",
    ],
  },
  {
    title: "Students",
    url: "/dashboard/students",
    icon: Users,
    roles: ["school_admin", "principal", "teacher", "receptionist"],
  },
  {
    title: "Classes & Sections",
    url: "/dashboard/classes",
    icon: School,
    roles: ["school_admin", "principal"],
  },
  {
    title: "Teachers",
    url: "/dashboard/teachers",
    icon: GraduationCap,
    roles: ["school_admin", "principal"],
  },
  {
    title: "Attendance",
    url: "/dashboard/attendance",
    icon: CalendarCheck,
    roles: ["school_admin", "principal", "teacher"],
  },
];
