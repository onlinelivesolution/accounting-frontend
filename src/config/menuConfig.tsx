import { lazy } from "react";

// Lazy load components for performance
const Employees = lazy(() => import("../Components/Employees"));
const GenerateSalary = lazy(() => import("../Components/GenerateSalary"));
const ApproveSalary = lazy(() => import("../Components/ApproveSalary"));
const ControlItem = lazy(() => import("../Components/ControlItems"));
const ReportingItem = lazy(() => import("../Components/ReportingItems"));
const DetailItem = lazy(() => import("../Components/DetailItems"));
const PayScaleMappings = lazy(() => import("../Components/PayScaleMappings"));
const RolePermissionAssign = lazy(() => import("../Components/RolePermissionAssign"));

// 🧭 Unified menu + route configuration
export const menuConfig = [
  {
    label: "Employee",
    icon: "👤",
    items: [
      {
        name: "Employees",
        path: "/employees",
        component: Employees,
        permission: "Salary.Add Employee",
      },
    ],
  },
  {
    label: "Salary",
    icon: "💰",
    items: [
      {
        name: "Generate Salary",
        path: "/generatesalary",
        component: GenerateSalary,
        permission: "Employee.Add Salary",
      },
      {
        name: "Approve Salary",
        path: "/approvesalary",
        component: ApproveSalary,
        permission: "Employee.Add Salary",
      },
    ],
  },
  {
    label: "Accounts",
    icon: "📘",
    items: [
      {
        name: "Control Items",
        path: "/controlItems",
        component: ControlItem,
        permission: "Accounts.Add Account",
      },
      {
        name: "Reporting Items",
        path: "/reportingItems",
        component: ReportingItem,
        permission: "Accounts.Add Account",
      },
      {
        name: "Detail Items",
        path: "/detailItems",
        component: DetailItem,
        permission: "Accounts.Add Account",
      },
    ],
  },
  {
    label: "Management",
    icon: "⚙️",
    items: [
      {
        name: "Pay Scale Mappings",
        path: "/payScaleMappings",
        component: PayScaleMappings,
        permission: "User.Add User",
      },
      {
        name: "Role Permission Assign",
        path: "/rolePermissionAssign",
        component: RolePermissionAssign,
        permission: "User.Add User",
      },
    ],
  },
];
