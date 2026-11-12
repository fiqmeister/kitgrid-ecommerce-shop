// the frame of the shop
import { Router, Route, useLocation } from 'wouter';
import Header from './components/Header'; // import Header
import ProductList from './pages/ProductList';
import LoginPage from './pages/LoginPage';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import CheckoutHeader from './components/CheckoutHeader';
import CheckoutPage from './pages/CheckoutPage';

function App() {
  const [location] = useLocation(); // the current path, eg "/checkout"

  return (
    <>
      {location === '/checkout' ? <CheckoutHeader /> : <Header />}

      <main className="container py-4">
        <Router>
          {/* placeholders for now: each one becomes a real page component in the next steps */}
          <Route path="/">
            <h1>Home</h1>
            <p>Coming soon.</p>
          </Route>
          <Route path="/products" component={ProductList} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/login" component={LoginPage} />
          <Route path="/cart" component={CartPage} />
          <Route path="/checkout" component={CheckoutPage} />
        </Router>
      </main>
    </>
  );
}

export default App;
