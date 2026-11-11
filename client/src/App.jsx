// the frame of the shop
import { Router, Route } from 'wouter';
import Header from './components/Header'; // import Header
import ProductList from './pages/ProductList';
import LoginPage from './pages/LoginPage';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';


function App() {

  return (
    <>
      <Header /> {/* the Header on every page */}

      <main className="container py-4">
        <Router>
          {/* placeholders for now: each one becomes a real page component in the next steps */}
          <Route path="/">
            <h1>Home</h1>
            <p>Coming soon.</p>
          </Route>
          <Route path="/products" component={ProductList}/>
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/login" component={LoginPage}/>
          <Route path="/cart" component={CartPage}/>
          <Route path="/checkout">
            <h1>Checkout</h1>
            <p>Coming soon</p>
          </Route>
        </Router>
      </main>
    </>
  );
}

export default App;
