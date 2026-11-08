// the top of every page: delivery banner, logo, login link, cart link and the category menu
import { Link, useSearch } from 'wouter';
import './Header.css';
import categories from '../categories';

export default function Header() {
    
    const activeCategoryId = new URLSearchParams(useSearch()).get('categoryId');

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
            <Link key={category.id} href={'/products?categoryId=' + category.id} 
            className={'kg-category-link' + (String(category.id) === activeCategoryId ? ' active' : '')}>
              {category.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
