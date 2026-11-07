// the top of every page: delivery banner, logo, login link, cart link and the category menu
import { Link } from 'wouter';
import './Header.css';

// the 4 categories from the categories db table
const categories = [
  { id: 1, name: 'Matchday Kits' },
  { id: 2, name: 'Training Wear' },
  { id: 3, name: 'Training Equipment' },
  { id: 4, name: 'Coach & Staff Apparel' },
];

export default function Header() {
  return (
    <header>
      {/* navy strip at the very top */}
      <div className="kg-banner">FREE DELIVERY ON ORDERS OF 15+ ITEMS</div>

      {/* white bar: logo on the left, account and cart on the right */}
      <div className="kg-header-main">
        <div className="container d-flex align-items-center justify-content-between py-3">
          <Link href="/" className="kg-logo">kitgrid彡</Link>
          <div className="d-flex align-items-center gap-4">
            <Link href="/login" className="kg-header-link">Log in / Register</Link>
            <Link href="/cart" className="kg-header-link">Cart</Link>
          </div>
        </div>
      </div>

      {/* category menu: the 4 categories link and filtered according to the category */}
      <nav className="kg-category-nav">
        <div className="container d-flex gap-4 py-2 overflow-auto">
          {categories.map((category) => (
            <Link key={category.id} href={'/products?categoryId=' + category.id} className="kg-category-link">
              {category.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
