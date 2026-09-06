import Card from "../components/Card";
import Button from "../components/Button";

function Dashboard() {
    return (
        <div className="dashboard-page">

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's what's happening with your business.</p>
                </div>

                <div className="page-header-actions">
                    <Button>
                        + Create Invoice
                    </Button>
                </div>
            </div>


            {/* Stats */}
            <div className="stats-grid">

                <Card>
                    <div className="stat-card">
                        <p>Total Revenue</p>
                        <h2>₹0.00</h2>
                        <span>This month</span>
                    </div>
                </Card>

                <Card>
                    <div className="stat-card">
                        <p>Total Invoices</p>
                        <h2>0</h2>
                        <span>This month</span>
                    </div>
                </Card>

                <Card>
                    <div className="stat-card">
                        <p>Pending Payments</p>
                        <h2>₹0.00</h2>
                        <span>Awaiting payment</span>
                    </div>
                </Card>

                <Card>
                    <div className="stat-card">
                        <p>Total Customers</p>
                        <h2>0</h2>
                        <span>Active customers</span>
                    </div>
                </Card>

            </div>


            {/* Dashboard Content */}
            <div className="dashboard-grid">

                {/* Recent Invoices */}
                <Card className="recent-invoices">

                    <div className="card-header">
                        <div>
                            <h3>Recent Invoices</h3>
                            <p>Your latest invoices will appear here.</p>
                        </div>

                        <Button variant="secondary">
                            View All
                        </Button>
                    </div>

                    <div className="empty-state">
                        <h3>No invoices yet</h3>
                        <p>
                            Create your first invoice to see it here.
                        </p>

                        <Button>
                            Create Invoice
                        </Button>
                    </div>

                </Card>


                {/* Quick Actions */}
                <Card>

                    <div className="card-header">
                        <div>
                            <h3>Quick Actions</h3>
                            <p>Common tasks</p>
                        </div>
                    </div>

                    <div className="quick-actions">

                        <Button>
                            Create Invoice
                        </Button>

                        <Button variant="secondary">
                            Create Quotation
                        </Button>

                        <Button variant="secondary">
                            Add Customer
                        </Button>

                        <Button variant="secondary">
                            Add Product
                        </Button>

                    </div>

                </Card>

            </div>

        </div>
    );
}

export default Dashboard;