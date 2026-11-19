import {
  LayoutDashboard,
  Users,
  School,
  GraduationCap,
  CalendarCheck,
  FileText,
  PencilLine,
  Wallet,
  Clock,
  Megaphone,
  ClipboardList,
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
  {
    title: "Examinations",
    url: "/dashboard/examinations",
    icon: FileText,
    roles: ["school_admin", "principal", "teacher"],
  },
  {
    title: "Enter Marks",
    url: "/dashboard/examinations/marks",
    icon: PencilLine,
    roles: ["school_admin", "teacher"],
  },
  {
    title: "Fees",
    url: "/dashboard/fees",
    icon: Wallet,
    roles: ["school_admin", "accountant", "principal"],
  },
  {
    title: "Timetable",
    url: "/dashboard/timetable",
    icon: Clock,
    roles: ["school_admin", "principal", "teacher", "student"],
  },
  {
    title: "My Children",
    url: "/dashboard/children",
    icon: Users,
    roles: ["parent"],
  },
  {
    title: "Announcements",
    url: "/dashboard/announcements",
    icon: Megaphone,
    roles: [
      "school_admin",
      "principal",
      "teacher",
      "student",
      "parent",
      "receptionist",
      "accountant",
    ],
  },
  {
    title: "Admissions",
    url: "/dashboard/admissions",
    icon: ClipboardList,
    roles: ["school_admin", "principal", "receptionist"],
  },
];
