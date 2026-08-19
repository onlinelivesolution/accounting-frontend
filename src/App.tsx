// src/App.tsx
import React, { useEffect, useState, useRef } from "react";
import logo from "../public/logo.png";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import DepositWithdraw from "./Components/DepositWithdraw";
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
import StudentList from "./Components/students/StudentList";
import StudentAdd from "./Components/students/StudentAdd";
import AcademicYear from "./Components/AcademicYears";
import Enrollment from "./Components/Enrollments";
import Examinations from "./Components/Examinations";
import Feeheads from "./Components/Feeheads";
import Feepayments from "./Components/Feepayments";
import Promotions from "./Components/Promotions";
import Results from "./Components/Results";
import Sections from "./Components/Sections";
import Classes from "./Components/Classes";
import Studentfees from "./Components/Studentfees";
import StudentEdit from "./Components/students/StudentEdit";
import StudentView from "./Components/students/StudentView";

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
  label: string;
  category: string;
  menuItems: MenuItem[];
  isOpen: boolean;
  onToggle: (category: string) => void;
  onNavigate: (path: string) => void;
  activeParent?: boolean;
}

const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -6,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.98,
  },
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
        onToggle("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onToggle]);

  const items = menuItems.filter((m) => m.category === category);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => onToggle(category)}
        aria-expanded={isOpen}
        className={`
          flex items-center justify-between
          whitespace-nowrap
          rounded-lg
          px-3 py-2
          text-sm
          transition-all duration-200
          ${
            activeParent || isOpen
              ? "bg-blue-50 text-blue-700 font-semibold"
              : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
          }
        `}
      >
        <span className="select-none">{label}</span>

        <ChevronDown
          className={`
            ml-2 h-4 w-4
            transition-transform duration-200
            ${isOpen ? "rotate-180" : ""}
          `}
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
            className="
              absolute
              left-0
              top-full
              mt-2
              z-[100]
              w-56
              max-h-[70vh]
              overflow-y-auto
              rounded-xl
              border
              border-gray-200
              bg-white
              shadow-xl
            "
          >
            {items.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <button
                  type="button"
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`
                    block
                    w-full
                    px-4
                    py-2.5
                    text-left
                    text-sm
                    transition-colors
                    duration-150
                    ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                    }
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
}

const sidebarVariants = {
  closed: {
    x: "100%",
  },
  open: {
    x: 0,
  },
};

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  open,
  onClose,
  menuItems,
  onNavigate,
}) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const categories = Array.from(
    new Set(
      menuItems
        .map((m) => m.category)
        .filter((category): category is string => Boolean(category)),
    ),
  );

  const handleNavigate = (path: string) => {
    onNavigate(path);
    onClose();
    setOpenCategory(null);
  };

  const toggleCategory = (category: string) => {
    setOpenCategory((previous) => (previous === category ? null : category));
  };

  useEffect(() => {
    if (!open) {
      setOpenCategory(null);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="
              fixed
              inset-0
              z-[90]
              bg-black
              md:hidden
            "
          />

          {/* Mobile Menu */}
          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="
              fixed
              right-0
              top-0
              bottom-0
              z-[100]
              flex
              w-[85vw]
              max-w-sm
              flex-col
              bg-white
              shadow-2xl
              md:hidden
            "
          >
            {/* Header */}
            <div
              className="
                flex
                shrink-0
                items-center
                justify-between
                border-b
                border-gray-200
                px-5
                py-4
              "
            >
              <div>
                <h2 className="text-lg font-bold text-gray-800">Menu</h2>

                <p className="text-xs text-gray-500">Navigation</p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="
                  rounded-lg
                  p-2
                  text-gray-600
                  transition
                  hover:bg-gray-100
                  hover:text-gray-900
                "
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Menu Content */}
            <nav
              className="
                flex-1
                overflow-y-auto
                px-3
                py-4
              "
            >
              {/* Dashboard / Non-category items */}
              {menuItems
                .filter((item) => !item.category)
                .map((item) => {
                  const isActive = location.pathname === item.path;

                  return (
                    <button
                      type="button"
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`
                        mb-1
                        w-full
                        rounded-lg
                        px-4
                        py-3
                        text-left
                        text-sm
                        font-medium
                        transition
                        ${
                          isActive
                            ? "bg-blue-500 text-white"
                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                        }
                      `}
                    >
                      {item.name}
                    </button>
                  );
                })}

              {/* Categories */}
              <div className="mt-2 space-y-1">
                {categories.map((category) => {
                  const isOpen = openCategory === category;

                  const categoryItems = menuItems.filter(
                    (item) => item.category === category,
                  );

                  const categoryIsActive = categoryItems.some(
                    (item) => item.path === location.pathname,
                  );

                  return (
                    <div key={category} className="border-b border-gray-100">
                      {/* Category Button */}
                      <button
                        type="button"
                        onClick={() => toggleCategory(category)}
                        aria-expanded={isOpen}
                        className={`
                          flex
                          w-full
                          items-center
                          justify-between
                          rounded-lg
                          px-4
                          py-3
                          text-left
                          text-sm
                          font-semibold
                          transition
                          ${
                            categoryIsActive
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }
                        `}
                      >
                        <span>{category}</span>

                        <ChevronDown
                          className={`
                            h-5 w-5
                            transition-transform
                            duration-200
                            ${isOpen ? "rotate-180" : ""}
                          `}
                        />
                      </button>

                      {/* Submenu */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{
                              height: 0,
                              opacity: 0,
                            }}
                            animate={{
                              height: "auto",
                              opacity: 1,
                            }}
                            exit={{
                              height: 0,
                              opacity: 0,
                            }}
                            transition={{
                              duration: 0.2,
                            }}
                            className="overflow-hidden"
                          >
                            <div className="mb-2 ml-2 space-y-1 border-l-2 border-blue-100 pl-2">
                              {categoryItems.map((item) => {
                                const isActive =
                                  location.pathname === item.path;

                                return (
                                  <button
                                    type="button"
                                    key={item.path}
                                    onClick={() => handleNavigate(item.path)}
                                    className={`
                                        block
                                        w-full
                                        rounded-lg
                                        px-4
                                        py-2.5
                                        text-left
                                        text-sm
                                        transition
                                        ${
                                          isActive
                                            ? "bg-blue-500 text-white"
                                            : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                        }
                                      `}
                                  >
                                    {item.name}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
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

    // School Management
    if (user?.isSuperAdmin || hasPermission("Education", "View")) {
      items.push({
        name: "Academic Year",
        path: "/school/academic-year",
        category: "Education",
      });

      items.push({
        name: "Classes",
        path: "/school/classes",
        category: "Education",
      });

      items.push({
        name: "Sections",
        path: "/school/sections",
        category: "Education",
      });

      items.push({
        name: "Students",
        path: "/school/students",
        category: "Education",
      });

      items.push({
        name: "Enrollment",
        path: "/school/enrollment",
        category: "Education",
      });

      items.push({
        name: "Examinations",
        path: "/school/examinations",
        category: "Education",
      });

      items.push({
        name: "Results",
        path: "/school/results",
        category: "Education",
      });

      items.push({
        name: "Promotion",
        path: "/school/promotion",
        category: "Education",
      });

      items.push({
        name: "Fee Heads",
        path: "/school/fee-heads",
        category: "Education",
      });

      items.push({
        name: "Student Fees",
        path: "/school/student-fees",
        category: "Education",
      });

      items.push({
        name: "Fee Payment",
        path: "/school/fee-payment",
        category: "Education",
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

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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
        <header
          className="
      sticky
      top-0
      z-[80]
      w-full
      border-b
      border-gray-200
      bg-white
      shadow-sm
    "
        >
          <div
            className="
        flex
        min-h-[64px]
        w-full
        items-center
        justify-between
        gap-3
        px-3
        py-2
        sm:px-4
        md:px-6
      "
          >
            {/* Left side */}
            <div className="flex min-w-0 items-center gap-3" ref={menuRef}>
              {/* Logo */}
              <div className="flex shrink-0 items-center">
                <img
                  src={logo}
                  alt="Online Solution Logo"
                  className="
              h-8
              w-auto
              sm:h-9
            "
                />

                <h1
                  className="
              ml-2
              hidden
              whitespace-nowrap
              text-lg
              font-bold
              sm:block
              md:text-xl
            "
                >
                  <span style={{ color: "#00CDCD" }}>Online</span>{" "}
                  <span style={{ color: "#8B1C62" }}>Solution</span>
                </h1>
              </div>

              {/* Desktop navigation */}
              <nav
                className="
            hidden
            min-w-0
            items-center
            gap-1
            lg:flex
            xl:gap-2
          "
              >
                {/* Non-category items */}
                {menuItems
                  .filter((item) => !item.category)
                  .map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                      <button
                        type="button"
                        key={item.path}
                        onClick={() => navigateAndClose(item.path)}
                        className={`
                    whitespace-nowrap
                    rounded-lg
                    px-2.5
                    py-2
                    text-sm
                    transition
                    xl:px-3
                    ${
                      isActive
                        ? "bg-blue-50 font-semibold text-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    }
                  `}
                      >
                        {item.name}
                      </button>
                    );
                  })}

                {/* Category dropdowns */}
                {Array.from(
                  new Set(
                    menuItems
                      .map((item) => item.category)
                      .filter((category): category is string =>
                        Boolean(category),
                      ),
                  ),
                ).map((category) => (
                  <DropdownMenu
                    key={category}
                    label={category}
                    category={category}
                    menuItems={menuItems}
                    isOpen={dropdownOpen === category}
                    onToggle={toggleDropdown}
                    onNavigate={navigateAndClose}
                    activeParent={activeParent() === category}
                  />
                ))}
              </nav>
            </div>

            {/* Right side */}
            <div
              className="
          flex
          shrink-0
          items-center
          gap-2
          sm:gap-3
        "
            >
              {/* Username */}
              <span
                className="
            hidden
            max-w-[160px]
            truncate
            text-sm
            font-medium
            text-gray-700
            xl:block
          "
                title={user.userName}
              >
                {user.userName}
              </span>

              {/* Logout */}
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                  navigate("/");
                }}
                className="
            hidden
            rounded-lg
            px-2
            py-2
            text-sm
            font-semibold
            text-red-600
            transition
            hover:bg-red-50
            hover:text-red-700
            sm:block
          "
              >
                Logout
              </button>

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
                className="
            rounded-lg
            p-2
            text-gray-700
            transition
            hover:bg-gray-100
            lg:hidden
          "
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Sidebar */}
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        menuItems={menuItems}
        onNavigate={navigateAndClose}
      />

      {/* Main area */}
      <main
        className="
    min-w-0
    flex-1
    p-3
    sm:p-4
    md:p-6
  "
      >
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

          <Route
            path="/school/students"
            element={
              <ProtectedRoute permissionName="Education" actionName="List">
                <StudentList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/school/students/add"
            element={
              <ProtectedRoute permissionName="Education" actionName="add">
                <StudentAdd />
              </ProtectedRoute>
            }
          />

          <Route
            path="/school/students/:studentID/edit"
            element={
              <ProtectedRoute permissionName="Education" actionName="edit">
                <StudentEdit />
              </ProtectedRoute>
            }
          />

          <Route
            path="/school/students/:studentID/view"
            element={
              <ProtectedRoute permissionName="Education" actionName="view">
                <StudentView />
              </ProtectedRoute>
            }
          />

          <Route
            path="/school/academic-year"
            element={
              <ProtectedRoute permissionName="Education" actionName="Add">
                <AcademicYear />
              </ProtectedRoute>
            }
          />

          <Route
            path="/school/Classes"
            element={
              <ProtectedRoute permissionName="Education" actionName="Add">
                <Classes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/Sections"
            element={
              <ProtectedRoute permissionName="Education" actionName="Add">
                <Sections />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/Enrollment"
            element={
              <ProtectedRoute permissionName="Education" actionName="Add">
                <Enrollment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/Examinations"
            element={
              <ProtectedRoute permissionName="Education" actionName="Add">
                <Examinations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/Results"
            element={
              <ProtectedRoute permissionName="Education" actionName="Add">
                <Results />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/Promotion"
            element={
              <ProtectedRoute permissionName="Education" actionName="Add">
                <Promotions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/fee-heads"
            element={
              <ProtectedRoute permissionName="Education" actionName="Add">
                <Feeheads />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/student-fees"
            element={
              <ProtectedRoute permissionName="Education" actionName="Add">
                <Studentfees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/student-fees"
            element={
              <ProtectedRoute permissionName="Education" actionName="Add">
                <Feepayments />
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
