// the frame of the shop
import { Router, Route, useLocation } from 'wouter';
import Header from './components/Header';
import ProductList from './pages/ProductList';
import LoginPage from './pages/LoginPage';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import CheckoutHeader from './components/CheckoutHeader';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import KitAdvisor from './components/KitAdvisor';
import HomePage from './pages/HomePage';

function App() {
  const [location] = useLocation(); // the current path, eg "/checkout"

  return (
    <>
      {location === '/checkout' ? <CheckoutHeader /> : <Header />}

      <main className="container py-4">
        <Router>
          <Route path="/" component={HomePage} />
          <Route path="/products" component={ProductList} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/login" component={LoginPage} />
          <Route path="/cart" component={CartPage} />
          <Route path="/checkout" component={CheckoutPage} />
          <Route path="/orders" component={OrdersPage} />
          <Route path="/orders/:id" component={OrderDetailPage} />
          <Route path="/orders/:id/confirmation" component={OrderConfirmationPage} />
        </Router>
      </main>
      {/* the Kit Advisor button floats over every page except checkout (no distractions while paying) */}
      {location !== '/checkout' && <KitAdvisor />}
    </>
  );
}

export default App;
