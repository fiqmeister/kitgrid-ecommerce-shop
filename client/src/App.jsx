// the frame of the shop
import { Router, Route } from 'wouter';
import Header from './components/Header'; // import Header
import ProductList from './pages/ProductList';


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
          <Route path="/products" component={ProductList}>
          </Route>
          <Route path="/login">
            <h1>Log in / Register</h1>
          </Route>
          <Route path="/cart">
            <h1>Cart</h1>
          </Route>
        </Router>
      </main>
    </>
  );
}

export default App;
