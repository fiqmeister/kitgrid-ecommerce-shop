// the small header on the checkout: logo, "Secure checkout" and "Back to cart"
// no search, categories or cart badge, so the customer stays focused on finishing (user story 17)
import { Link } from 'wouter';
import './Header.css'; // reuses the logo bar and link styles of the full header

export default function CheckoutHeader() {
    return (
        <header className="kg-header-main">
            <div className="container d-flex align-items-center gap-3 py-3">
                <Link href="/" className="kg-logo">kitgrid彡</Link>
                {/* hidden on very small phones (d-none d-sm-inline), so the bar stays on one line */}
                <span className="kg-checkout-secure d-none d-sm-inline ms-auto">
                    <span aria-hidden="true">🔒</span> Secure checkout
                </span>
                <Link href="/cart" className="kg-header-link ms-auto ms-sm-0">← Back to cart</Link>
            </div>
        </header>
    );
}
