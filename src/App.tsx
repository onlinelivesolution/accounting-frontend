// src/App.tsx
import React, { useEffect, useState, useRef } from "react";
import logo from "../public/logo.png";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import DepositWithdraw from "./Components/DepositWithdraw";
import Dashboard from "./pages/Dashboard";
import LoginUser from "./Components/LoginUser";
import JournalEntry from "./Components/JournalEntry";
import BalanceSheet from "./Components/BalanceSheet";
import ProfitAndLoss from "./Components/ProfitAndLoss";
import TrialBalance from "./Components/TrialBalance";
import ViewQuotation from "./Components/ViewQuotations";
import Quotations from "./Components/Quotations";
import ViewSalesOrder from "./Components/ViewSalesOrders";
import SalesOrders from "./Components/SalesOrders";
import SalesInvoiceView from "./Components/SalesInvoiceView";
import SalesInvoices from "./Components/SalesInvoices";
import VerifyOTP from "./Components/VerifyOTP";
import ViewCustomerReceipt from "./Components/ViewCustomerReceipts";
import CustomerReceipt from "./Components/CustomerReceipts";
import TenantManagement from "./Components/TenantManagement";
import RegisterTenant from "./Components/RegisterTenant";
import AdminProtectedRoute from "./Components/AdminProtectedRoute";
import AdminLogin from "./Components/AdminLogin";
import AdminVerifyOTP from "./Components/AdminVerifyOTP";
import AccountingRuleSettings from "./Components/AccountingRulSettings";
import AddNewAccount from "./Components/AddNewAccount";
import Employee from "./Components/Employees";
import GenerateSalaries from "./Components/GenerateSalary";
import GenerateBonuses from "./Components/GenerateBonus";
import BankAccounts from "./Components/BankAccounts";
import ApproveSalaries from "./Components/ApproveSalary";
import ProtectedRoute from "./Components/ProtectedRoute";
import { useAuth } from "./Components/securityContext";
import PayscaleMappings from "./Components/PayScaleMappings";
import UserInfos from "./Components/UserInfo";
import PermissionAssign from "./Components/RolePermissionAssign";
import AdminDashboard from "./Components/AdminDashboard";
import PaymentSalary from "./Components/PaymentSalary";

// ------- Types -------
interface MenuItem {
  name: string;
  path: string;
  category?: string;
}

// ---------------------
// DropdownMenu Component
// ---------------------
interface DropdownMenuProps {
  label: string; // label shown on parent button (e.g. "Manage Accounts")
  category: string; // category key used to filter menuItems
  menuItems: MenuItem[];
  isOpen: boolean;
  onToggle: (category: string) => void;
  onNavigate: (path: string) => void;
  activeParent?: boolean;
}

const dropdownVariants = {
  hidden: { opacity: 0, y: -6, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.98 },
};

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  label,
  category,
  menuItems,
  isOpen,
  onToggle,
  onNavigate,
  activeParent,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onToggle(""); // close all
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onToggle]);

  const items = menuItems.filter((m) => m.category === category);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => onToggle(category)}
        aria-expanded={isOpen}
        className={`flex items-center px-3 py-2 transition rounded ${
          activeParent
            ? "text-blue-700 text-[10px] bg-blue-50"
            : "text-gray-700 hover:text-blue-600"
        }`}
      >
        <span className="select-none">{label}</span>
        <ChevronDown
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
            transition={{ duration: 0.16 }}
            className="absolute mt-2 w-52 bg-white border border-blue-300 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {items.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    onNavigate(item.path);
                  }}
                  className={`
              block w-full text-left px-4 py-2 
              transition-colors duration-200
              ${isActive ? "bg-blue-400 text-white rounded" : "hover:bg-blue-200 rounded"}
            `}
                >
                  {item.name}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------------------
// MobileSidebar Component
// ---------------------
interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onNavigate: (path: string) => void;
  hasPermission: (permissionName: string, actionName: string) => boolean;
}

const sidebarVariants = {
  closed: { x: "100%" },
  open: { x: 0 },
};

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  open,
  onClose,
  menuItems,
  onNavigate,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
          />

          <motion.aside
            className="fixed right-0 top-0 bottom-0 w-72 bg-white z-50 shadow-xl p-4 overflow-y-auto"
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px]">Menu</h2>
              <button onClick={onClose} aria-label="Close menu">
                <X />
              </button>
            </div>

            <nav className="flex flex-col space-y-2">
              {menuItems
                .filter((i) => !i.category)
                .map((i) => (
                  <button
                    key={i.path}
                    onClick={() => {
                      onNavigate(i.path);
                      onClose();
                    }}
                    className="text-left px-3 py-2 rounded hover:bg-gray-100"
                  >
                    {i.name}
                  </button>
                ))}

              {Array.from(
                new Set(menuItems.map((m) => m.category).filter(Boolean)),
              ).map((cat) => (
                <div key={cat}>
                  <div className="mt-3 mb-1 text-[10px] text-gray-500">
                    {cat}
                  </div>
                  <div className="flex flex-col">
                    {menuItems
                      .filter((m) => m.category === cat)
                      .map((m) => (
                        <button
                          key={m.path}
                          onClick={() => {
                            onNavigate(m.path);
                            onClose();
                          }}
                          className="text-left px-3 py-2 rounded hover:bg-gray-100"
                        >
                          {m.name}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// ---------------------
// Main App
// ---------------------
const App: React.FC = () => {
  const { user, hasPermission, logout } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Build menu
  useEffect(() => {
    if (!user) {
      setMenuItems([]);
      return;
    }

    const items: MenuItem[] = [];

    // Dashboard
    if (user?.isSuperAdmin || hasPermission("Dashboard", "View")) {
      items.push({
        name: "Dashboard",
        path: "/dashboard",
      });
    }

    // Accounts
    if (user?.isSuperAdmin || hasPermission("Accounts", "Add Account")) {
      items.push({
        name: "Journal Entry",
        path: "/journalEntry",
        category: "Accounts",
      });

      items.push({
        name: "Bank Account",
        path: "/bankAccounts",
        category: "Accounts",
      });

      items.push({
        name: "Add New Account",
        path: "/addNewAccount",
        category: "Accounts",
      });

      items.push({
        name: "Bank Transaction",
        path: "/depositWithdraw",
        category: "Accounts",
      });

      items.push({
        name: "Quotation",
        path: "/ViewQuotations",
        category: "Accounts",
      });

      items.push({
        name: "Sales Order",
        path: "/sales-orders",
        category: "Accounts",
      });

      items.push({
        name: "Sales Invoice",
        path: "/sales-invoices",
        category: "Accounts",
      });

      items.push({
        name: "Customer Receipt",
        path: "/customer-receipts",
        category: "Accounts",
      });

      items.push({
        name: "Accounting Setting",
        path: "/accounting-settings",
        category: "Accounts",
      });

      items.push({
        name: "Balance Sheet",
        path: "/BalanceSheet",
        category: "Accounts",
      });

      items.push({
        name: "Profit & Loss",
        path: "/ProfitAndLoss",
        category: "Accounts",
      });

      items.push({
        name: "Trial Balance",
        path: "/TrialBalance",
        category: "Accounts",
      });
    }

    // Quotations
    if (user?.isSuperAdmin || hasPermission("Quotations", "Add Quotation")) {
      items.push({
        name: "Quotation",
        path: "/quotations",
        category: "Quotations",
      });
    }

    // Employee
    if (user?.isSuperAdmin || hasPermission("Employees", "Add Employee")) {
      items.push({
        name: "Employee",
        path: "/employees",
        category: "Employee",
      });

      items.push({
        name: "Payscale Mapping",
        path: "/payScaleMappings",
        category: "Employee",
      });
    }

    // Salary
    if (user?.isSuperAdmin || hasPermission("Salary", "Add Employee")) {
      items.push({
        name: "Generate Salary",
        path: "/generateSalary",
        category: "Salary",
      });

      items.push({
        name: "Generate Bonus",
        path: "/GenerateBonuses",
        category: "Salary",
      });

      items.push({
        name: "Approve Salary",
        path: "/approveSalary",
        category: "Salary",
      });
    }

    // Financial
    if (user?.isSuperAdmin || hasPermission("Financial", "View")) {
      items.push({
        name: "Salary Payment",
        path: "/financial/payment",
        category: "Financial",
      });

      items.push({
        name: "Salary",
        path: "/financial/salary",
        category: "Financial",
      });

      items.push({
        name: "Bonus",
        path: "/financial/bonus",
        category: "Financial",
      });

      items.push({
        name: "Expense",
        path: "/financial/expense",
        category: "Financial",
      });
    }

    // User
    if (user?.isSuperAdmin || hasPermission("User", "Update User")) {
      items.push({
        name: "Manage User",
        path: "/manageUser",
        category: "User",
      });

      items.push({
        name: "Manage Permission",
        path: "/managePermission",
        category: "User",
      });
    }

    // Manage Tenant
    if (user?.isSuperAdmin) {
      items.push({
        name: "Admin Dashboard",
        path: "/admin/dashboard",
        category: "Admin",
      });

      items.push({
        name: "Manage Tenant",
        path: "/admin/manage-tenants",
        category: "Admin",
      });
    }
    setMenuItems(items);
  }, [user, hasPermission]);

  // close dropdowns on route change
  useEffect(() => {
    setDropdownOpen(null);
  }, [location.pathname]);

  // Close when clicking outside (for header area)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleDropdown = (cat: string) => {
    setDropdownOpen((prev) => (prev === cat ? null : cat));
  };

  const navigateAndClose = (path: string) => {
    navigate(path);
    setDropdownOpen(null);
    setMobileOpen(false);
  };

  const activeParent = () => {
    const active = menuItems.find((m) => m.path === location.pathname);
    return active?.category || null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      {user && (
        <header className="bg-white shadow-md px-2 py-2 flex items-center justify-between md:px-6">
          <div
            className="flex items-center space-x-4 md:space-x-6"
            ref={menuRef}
          >
            <div className="flex items-center">
              <img
                src={logo}
                alt="Online Solution Logo"
                className="h-8 w-auto pr-[10px]"
              />
              <h1 className="text-xl font-bold">
                <span style={{ color: "#00CDCD" }}>Online</span>{" "}
                <span style={{ color: "#8B1C62" }}>Solution</span>
              </h1>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center space-x-3">
              {menuItems
                .filter((i) => !i.category)
                .map((i) => (
                  <button
                    key={i.path}
                    onClick={() => navigateAndClose(i.path)}
                    className={`px-3 py-2 rounded transition ${
                      location.pathname === i.path
                        ? "text-blue-700 font-semibold bg-blue-50"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    {i.name}
                  </button>
                ))}

              {/* Dynamic Dropdowns */}
              {Array.from(
                new Set(menuItems.map((item) => item.category).filter(Boolean)),
              ).map((category) => (
                <DropdownMenu
                  key={category}
                  label={category!}
                  category={category!}
                  menuItems={menuItems}
                  isOpen={dropdownOpen === category}
                  onToggle={toggleDropdown}
                  onNavigate={navigateAndClose}
                  activeParent={activeParent() === category}
                />
              ))}
            </nav>
          </div>

          {/* Right side: logout + mobile menu button */}
          <div className="flex items-center space-x-3">
            <span className="hidden md:inline text-gray-700 font-medium">
              {user.userName}
            </span>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="text-red-600 font-semibold hover:underline"
            >
              Logout
            </button>

            {/* mobile button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Mobile sidebar */}
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        menuItems={menuItems}
        onNavigate={navigateAndClose}
        hasPermission={
          hasPermission as unknown as (a: string, b: string) => boolean
        }
      />

      {/* Main area */}
      <main className="flex-1 p-4 md:p-6">
        <Routes>
          <Route path="/" element={<LoginUser />} />
          <Route path="/login" element={<LoginUser />} />

          <Route path="/verify-otp" element={<VerifyOTP />} />

          <Route
            path="/journalEntry"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <JournalEntry />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ViewQuotations"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <ViewQuotation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Quotations"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <Quotations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales-orders"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <ViewSalesOrder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales-orders/new"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <SalesOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales-orders/:id/edit"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <SalesOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales-orders/:id/copy"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <SalesOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales-orders/:id/view"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <ViewSalesOrder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales-invoices"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <SalesInvoiceView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-invoices/new"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <SalesInvoices />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales-invoices/:id/edit"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <SalesInvoices />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales-invoices/:id/copy"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <SalesInvoices />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales-invoices/:id/view"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <SalesInvoiceView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-receipts"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <ViewCustomerReceipt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-receipts/new"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <CustomerReceipt />
              </ProtectedRoute>
            }
          />

          <Route path="/register-tenant" element={<RegisterTenant />} />

          <Route
            path="/admin/manage-tenants"
            element={
              <AdminProtectedRoute>
                <TenantManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin/verify-otp" element={<AdminVerifyOTP />} />

          <Route
            path="/customer-receipts/:id/edit"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <CustomerReceipt />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer-receipts/:id/copy"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <CustomerReceipt />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer-receipts/:id/view"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <ViewCustomerReceipt />
              </ProtectedRoute>
            }
          />

          <Route
            path="/accounting-settings"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <AccountingRuleSettings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/BalanceSheet"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <BalanceSheet />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ProfitAndLoss"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <ProfitAndLoss />
              </ProtectedRoute>
            }
          />

          <Route
            path="/TrialBalance"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <TrialBalance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/BankAccounts"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <BankAccounts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/AddNewAccount"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <AddNewAccount />
              </ProtectedRoute>
            }
          />
          <Route
            path="/DepositWithdraw"
            element={
              <ProtectedRoute
                permissionName="Accounts"
                actionName="Add Account"
              >
                <DepositWithdraw />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees"
            element={
              <ProtectedRoute
                permissionName="Employees"
                actionName="Add Employee"
              >
                <Employee />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payScaleMappings"
            element={
              <ProtectedRoute
                permissionName="Employees"
                actionName="Add Employee"
              >
                <PayscaleMappings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/generateSalary"
            element={
              <ProtectedRoute permissionName="Salary" actionName="Add Employee">
                <GenerateSalaries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generateBonuses"
            element={
              <ProtectedRoute permissionName="Salary" actionName="Add Employee">
                <GenerateBonuses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/approveSalary"
            element={
              <ProtectedRoute permissionName="Salary" actionName="Add Employee">
                <ApproveSalaries />
              </ProtectedRoute>
            }
          />

          <Route
            path="/approveSalary"
            element={
              <ProtectedRoute permissionName="Salary" actionName="Add Employee">
                <ApproveSalaries />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financial/salary"
            element={
              <ProtectedRoute permissionName="Financial" actionName="View">
                <GenerateSalaries />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financial/bonus"
            element={
              <ProtectedRoute permissionName="Financial" actionName="View">
                <GenerateBonuses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financial/expense"
            element={
              <ProtectedRoute permissionName="Financial" actionName="View">
                <h2>Expense Page</h2>
              </ProtectedRoute>
            }
          />

          <Route
            path="/financial/payment"
            element={
              <ProtectedRoute permissionName="Financial" actionName="View">
                <PaymentSalary />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manageUser"
            element={
              <ProtectedRoute permissionName="User" actionName="Update User">
                <UserInfos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/managePermission"
            element={
              <ProtectedRoute permissionName="User" actionName="Update User">
                <PermissionAssign />
              </ProtectedRoute>
            }
          />

          <Route path="/unauthorized" element={<h2>Unauthorized Access</h2>} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
