import {
    NavLink,
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* =========================================================
   Navigation Icons
   ========================================================= */

function NavIcon({ type }) {
    const commonProps = {
        width: 20,
        height: 20,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    switch (type) {
        case "dashboard":
            return (
                <svg {...commonProps}>
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
            );

        case "customers":
            return (
                <svg {...commonProps}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );

        case "products":
            return (
                <svg {...commonProps}>
                    <path d="m21 16-9 5-9-5" />
                    <path d="m21 12-9 5-9-5" />
                    <path d="m3 8 9-5 9 5-9 5-9-5Z" />
                </svg>
            );

        case "invoices":
            return (
                <svg {...commonProps}>
                    <path d="M6 2h9l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
                    <path d="M14 2v6h6" />
                    <path d="M8 13h8" />
                    <path d="M8 17h6" />
                </svg>
            );

        case "quotations":
            return (
                <svg {...commonProps}>
                    <path d="M6 2h9l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
                    <path d="M14 2v6h6" />
                    <path d="M8 13h8" />
                    <path d="M8 17h4" />
                </svg>
            );

        case "reports":
            return (
                <svg {...commonProps}>
                    <path d="M4 19V5" />
                    <path d="M4 19h17" />
                    <path d="m7 15 4-4 3 2 5-6" />
                </svg>
            );

        case "settings":
            return (
                <svg {...commonProps}>
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.4 1.4-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-2v-.5a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.4-1.4.06-.06A1.7 1.7 0 0 0 8.4 15a1.7 1.7 0 0 0-1.56-1.03H6v-2h.84A1.7 1.7 0 0 0 8.4 10a1.7 1.7 0 0 0-.34-1.88L8 8.06l1.4-1.4.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 12.37 5.5V5h2v.5A1.7 1.7 0 0 0 15.4 7a1.7 1.7 0 0 0 1.88-.34l.06-.06 1.4 1.4-.06.06A1.7 1.7 0 0 0 18.4 10a1.7 1.7 0 0 0 1.56 1.03h.84v2h-.84A1.7 1.7 0 0 0 19.4 15Z" />
                </svg>
            );

        default:
            return null;
    }
}


/* =========================================================
   Dashboard Layout
   ========================================================= */

function DashboardLayout() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    /* -----------------------------------------------------
       Current Page Title
       ----------------------------------------------------- */

    const pageTitles = {
        "/dashboard": "Dashboard",
        "/customers": "Customers",
        "/products": "Products & Services",
        "/invoices": "Invoices",
        "/quotations": "Quotations",
        "/reports": "Reports",
        "/settings": "Settings",
    };

    const currentPage =
        pageTitles[location.pathname] || "InvoicePro";


    /* -----------------------------------------------------
       Navigation Items
       ----------------------------------------------------- */

    const mainNavigation = [
        {
            label: "Dashboard",
            path: "/dashboard",
            icon: "dashboard",
        },
        {
            label: "Customers",
            path: "/customers",
            icon: "customers",
        },
        {
            label: "Products & Services",
            path: "/products",
            icon: "products",
        },
        {
            label: "Invoices",
            path: "/invoices",
            icon: "invoices",
        },
        {
            label: "Quotations",
            path: "/quotations",
            icon: "quotations",
        },
        {
            label: "Reports",
            path: "/reports",
            icon: "reports",
        },
    ];


    /* -----------------------------------------------------
       Logout Handler
       ----------------------------------------------------- */

    const handleLogout = () => {
        logout();
        navigate("/login");
    };


    return (
        <div className="dashboard-layout">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="sidebar">

                {/* -------------------------------------------------
                    Brand
                ------------------------------------------------- */}

                <div className="sidebar-brand">

                    <NavLink
                        to="/dashboard"
                        className="sidebar-brand-link"
                    >

                        <div className="sidebar-brand-icon">
                            IP
                        </div>

                        <div className="sidebar-brand-text">
                            <strong>InvoicePro</strong>
                            <span>Business Manager</span>
                        </div>

                    </NavLink>

                </div>


                {/* -------------------------------------------------
                    Main Navigation
                ------------------------------------------------- */}

                <div className="sidebar-section">

                    <span className="sidebar-section-title">
                        MAIN
                    </span>

                    <nav className="sidebar-nav">

                        {mainNavigation.map((item) => (

                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `sidebar-nav-link ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }`
                                }
                            >

                                <span className="sidebar-nav-icon">
                                    <NavIcon type={item.icon} />
                                </span>

                                <span className="sidebar-nav-label">
                                    {item.label}
                                </span>

                            </NavLink>

                        ))}

                    </nav>

                </div>


                {/* -------------------------------------------------
                    Manage
                ------------------------------------------------- */}

                <div className="sidebar-section sidebar-manage-section">

                    <span className="sidebar-section-title">
                        MANAGE
                    </span>

                    <nav className="sidebar-nav">

                        <NavLink
                            to="/settings"
                            className={({ isActive }) =>
                                `sidebar-nav-link ${
                                    isActive
                                        ? "active"
                                        : ""
                                }`
                            }
                        >

                            <span className="sidebar-nav-icon">
                                <NavIcon type="settings" />
                            </span>

                            <span className="sidebar-nav-label">
                                Settings
                            </span>

                        </NavLink>

                    </nav>

                </div>


                {/* -------------------------------------------------
                    Sidebar Bottom / Account
                ------------------------------------------------- */}

                <div className="sidebar-bottom">

                    <div className="sidebar-account">

                        <div className="sidebar-account-avatar">
                            {(user?.name || "U").charAt(0).toUpperCase()}
                        </div>

                        <div className="sidebar-account-info">

                            <strong>
                                {user?.name || "Your Account"}
                            </strong>

                            <span>
                                Manage your workspace
                            </span>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                        <span>Logout</span>

                        <span className="sidebar-logout-icon">
                            →
                        </span>
                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN AREA
            ================================================= */}

            <div className="main-area">

                {/* -------------------------------------------------
                    TOP NAVBAR
                ------------------------------------------------- */}

                <header className="navbar">

                    <div className="navbar-page-info">

                        <span className="navbar-page-label">
                            Workspace
                        </span>

                        <h2>
                            {currentPage}
                        </h2>

                    </div>


                    <div className="navbar-user">

                        <div className="navbar-welcome">

                            <span>Welcome back</span>

                            <strong>
                                {user?.name || "User"}
                            </strong>

                        </div>

                        <div className="navbar-avatar">
                            {(user?.name || "U").charAt(0).toUpperCase()}
                        </div>

                    </div>

                </header>


                {/* -------------------------------------------------
                    PAGE CONTENT
                ------------------------------------------------- */}

                <main className="page-content">

                    <Outlet />

                </main>

            </div>

        </div>
    );
}

export default DashboardLayout;