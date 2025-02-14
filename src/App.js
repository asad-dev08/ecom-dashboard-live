import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProductForm from "./components/products/ProductForm";
import Product from "./pages/Product";
import { ConfigProvider } from "antd";
import Order from "./pages/Order";
import Customer from "./pages/Customer";
import User from "./pages/User";
import CustomerDetails from './pages/CustomerDetails';
import SalesAnalytics from './pages/analytics/SalesAnalytics';
import RevenueMetrics from './pages/analytics/RevenueMetrics';
import ProductPerformance from './pages/analytics/ProductPerformance';
import CustomerInsights from './pages/analytics/CustomerInsights';
import InventoryReports from './pages/analytics/InventoryReports';
import Discounts from './pages/marketing/Discounts';
import Campaigns from './pages/marketing/Campaigns';
import Coupons from './pages/marketing/Coupons';
import EmailMarketing from './pages/marketing/EmailMarketing';
import Profile from './pages/settings/Profile';
import ChangePassword from './pages/settings/ChangePassword';
import './styles/global.css';
import { ThemeProvider } from "./context/ThemeContext";
import ThemeConfigProvider from "./components/ThemeConfigProvider";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ThemeConfigProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Product />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/products/new"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ProductForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/products/:id/edit"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ProductForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Order />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Customer />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <User />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/customers/:id"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <CustomerDetails />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/analytics/sales"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <SalesAnalytics />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics/revenue"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <RevenueMetrics />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics/products"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ProductPerformance />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics/customers"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <CustomerInsights />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics/inventory"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <InventoryReports />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Marketing Routes */}
              <Route
                path="/marketing/discounts"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Discounts />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketing/campaigns"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Campaigns />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketing/coupons"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Coupons />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketing/email"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <EmailMarketing />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Settings Routes */}
              <Route path="/settings/profile" element={<ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>} />
              <Route path="/settings/change-password" element={<ProtectedRoute>
                <DashboardLayout>
                  <ChangePassword />
                </DashboardLayout>
              </ProtectedRoute>} />

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        </ThemeConfigProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
