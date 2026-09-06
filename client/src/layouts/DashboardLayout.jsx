import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function DashboardLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="dashboard-layout">

            {/* Sidebar */}
            <aside className="sidebar">

                <div className="sidebar-logo">
                    InvoicePro
                </div>

                <nav className="sidebar-nav">

                    <NavLink to="/dashboard">
                        Dashboard
                    </NavLink>

                    <NavLink to="/customers">
                        Customers
                    </NavLink>

                    <NavLink to="/products">
                        Products & Services
                    </NavLink>

                    <NavLink to="/invoices">
                        Invoices
                    </NavLink>

                    <NavLink to="/quotations">
                        Quotations
                    </NavLink>

                    <NavLink to="/reports">
                        Reports
                    </NavLink>

                </nav>

                <div className="sidebar-bottom">
                    <NavLink to="/settings">
                        Settings
                    </NavLink>
                </div>

            </aside>

            {/* Main Area */}
            <div className="main-area">

                {/* Navbar */}
                <header className="navbar">

                    <h2>Invoice Generator</h2>

                    <div className="navbar-user">
                        <span>Welcome</span>

                        <button
                            type="button"
                            onClick={() => {
                                logout();
                                navigate("/login");
                            }}
                        >
                            Logout
                        </button>
                    </div>

                </header>

                {/* Current Page */}
                <main className="page-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default DashboardLayout;