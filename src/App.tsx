// src/App.tsx
import React, { useEffect, useState, useRef } from "react";
import logo from "../public/logo.png";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import DepositWithdraw from "./Components/DepositWithdraw";
import Dashboard from "./pages/Dashboard";
import LoginUser from "./Components/LoginUser";
import JournalEntry from "./Components/JournalEntry";
import BalanceSheet from "./Components/BalanceSheet";
import ViewQuotation from "./Components/ViewQuotations";
import Quotations from "./Components/Quotations";
import ViewSalesOrder from "./Components/ViewSalesOrders";
import SalesOrders from "./Components/SalesOrders";
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
        className={`flex items-center px-3 py-2 transition rounded ${activeParent ? "text-blue-700 text-[10px] bg-blue-50" : "text-gray-700 hover:text-blue-600"
          }`}
      >
        <span className="select-none">{label}</span>
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
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

const MobileSidebar: React.FC<MobileSidebarProps> = ({ open, onClose, menuItems, onNavigate }) => {
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

              {Array.from(new Set(menuItems.map((m) => m.category).filter(Boolean))).map((cat) => (
                <div key={cat}>
                  <div className="mt-3 mb-1 text-[10px] text-gray-500">{cat}</div>
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

    if (hasPermission("Dashboard", "View")) items.push({ name: "Dashboard", path: "/dashboard" });

    if (hasPermission("Accounts", "Add Account")) {
      items.push({ name: "Journal Entry", path: "/journalEntry", category: "Accounts" });
      items.push({ name: "Bank Account", path: "/bankAccounts", category: "Accounts" });
      items.push({ name: "Add New Account", path: "/addNewAccount", category: "Accounts" });
      items.push({ name: "Bank Transaction", path: "/depositWithdraw", category: "Accounts" });
      items.push({ name: "Quotation", path: "/ViewQuotations", category: "Accounts" });
      //items.push({ name: "Sales Order", path: "/ViewSalesOrders", category: "Accounts" });

      items.push({ name: "Sales Order", path: "/sales-orders", category: "Accounts" });

      items.push({ name: "Balance Sheet", path: "/BalanceSheet", category: "Accounts" });
    }

    if (hasPermission("Quotations", "Add Quotation")) {
      items.push({ name: "Quotation", path: "/quotations", category: "Quotations" });
    }

    if (hasPermission("Employees", "Add Employee")) {
      items.push({ name: "Employee", path: "/employees", category: "Employee" });
      items.push({ name: "Payscale Mapping", path: "/payScaleMappings", category: "Employee" });

    }

    if (hasPermission("Salary", "Add Employee")) {
      items.push({ name: "Generate Salary", path: "/generateSalary", category: "Salary" });
      items.push({ name: "Generate Bonus", path: "/GenerateBonuses", category: "Salary" });
      items.push({ name: "Approve Salary", path: "/approveSalary", category: "Salary" });
    }

    if (hasPermission("User", "Update User")) {
      items.push({ name: "Manage User", path: "/manageUser", category: "User" });
      items.push({ name: "Manage Permission", path: "/managePermission", category: "User" });
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
          <div className="flex items-center space-x-4 md:space-x-6" ref={menuRef}>
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
                    className={`px-3 py-2 rounded transition ${location.pathname === i.path ? "text-blue-700 font-semibold bg-blue-50" : "text-gray-700 hover:text-blue-600"
                      }`}
                  >
                    {i.name}
                  </button>
                ))}

              {/* Dropdowns */}
              <DropdownMenu
                label="Manage Accounts"
                category="Accounts"
                menuItems={menuItems}
                isOpen={dropdownOpen === "Accounts"}
                onToggle={(c) => toggleDropdown(c)}
                onNavigate={navigateAndClose}
                activeParent={activeParent() === "Accounts"}
              />

              <DropdownMenu
                label="Employee"
                category="Employee"
                menuItems={menuItems}
                isOpen={dropdownOpen === "Employee"}
                onToggle={(c) => toggleDropdown(c)}
                onNavigate={navigateAndClose}
                activeParent={activeParent() === "Employee"}
              />

              <DropdownMenu
                label="Salary"
                category="Salary"
                menuItems={menuItems}
                isOpen={dropdownOpen === "Salary"}
                onToggle={(c) => toggleDropdown(c)}
                onNavigate={navigateAndClose}
                activeParent={activeParent() === "Salary"}
              />

              <DropdownMenu
                label="Manage User"
                category="User"
                menuItems={menuItems}
                isOpen={dropdownOpen === "User"}
                onToggle={(c) => toggleDropdown(c)}
                onNavigate={navigateAndClose}
                activeParent={activeParent() === "User"}
              />
            </nav>
          </div>

          {/* Right side: logout + mobile menu button */}
          <div className="flex items-center space-x-3">
            <span className="hidden md:inline text-gray-700 font-medium">{user.userName}</span>
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
              <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
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
        hasPermission={hasPermission as unknown as (a: string, b: string) => boolean}
      />

      {/* Main area */}
      <main className="flex-1 p-4 md:p-6">
        <Routes>
          <Route path="/" element={<LoginUser />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute permissionName="Dashboard" actionName="View">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/journalEntry"
            element={
              <ProtectedRoute permissionName="Accounts" actionName="Add Account">
                <JournalEntry />
              </ProtectedRoute>
            }
          />


          <Route
            path="/ViewQuotations"
            element={
              <ProtectedRoute permissionName="Accounts" actionName="Add Account">
                <ViewQuotation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Quotations"
            element={
              <ProtectedRoute permissionName="Accounts" actionName="Add Account">
                <Quotations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales-orders"
            element={
              <ProtectedRoute permissionName="Accounts" actionName="Add Account">
                <ViewSalesOrder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales-orders/new"
            element={
              <ProtectedRoute permissionName="Accounts" actionName="Add Account">
                <SalesOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales-orders/:id/edit"
            element={
              <ProtectedRoute permissionName="Accounts" actionName="Add Account">
                <SalesOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales-orders/:id/copy"
            element={
              <ProtectedRoute permissionName="Accounts" actionName="Add Account">
                <SalesOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales-orders/:id/view"
            element={
              <ProtectedRoute permissionName="Accounts" actionName="Add Account">
                <ViewSalesOrder />
              </ProtectedRoute>
            }
          />

          {/* <Route
            path="/ViewSalesOrders"
            element={
              <ProtectedRoute permissionName="Accounts" actionName="Add Account">
                <ViewSalesOrder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/SalesOrders"
            element={
              <ProtectedRoute permissionName="Accounts" actionName="Add Account">
                <SalesOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/SalesOrders/:id"
            element={
              <ProtectedRoute permissionName="Accounts" actionName="Add Account">
                <SalesOrders />
              </ProtectedRoute>
            }
          /> */}

          <Route
            path="/BalanceSheet"
            element={
              <ProtectedRoute permissionName="Accounts" actionName="Add Account">
                <BalanceSheet />
              </ProtectedRoute>
            }
          />

          <Route
            path="/BankAccounts"
            element={
              <ProtectedRoute permissionName="Accounts" actionName="Add Account">
                <BankAccounts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/AddNewAccount"
            element={
              <ProtectedRoute permissionName="Accounts" actionName="Add Account">
                <AddNewAccount />
              </ProtectedRoute>
            }
          />
          <Route
            path="/DepositWithdraw"
            element={
              <ProtectedRoute permissionName="Accounts" actionName="Add Account">
                <DepositWithdraw />
              </ProtectedRoute>
            }
          />


          <Route
            path="/employees"
            element={
              <ProtectedRoute permissionName="Employees" actionName="Add Employee">
                <Employee />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payScaleMappings"
            element={
              <ProtectedRoute permissionName="Employees" actionName="Add Employee">
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
