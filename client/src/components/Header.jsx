// the top of every page: delivery banner, logo, login link, cart link and the category menu
import { useState, useEffect } from 'react';
import { Link, useSearch, useLocation } from 'wouter';
import './Header.css';
import categories from '../categories';
import api from '../api';
import { useUser } from '../stores/UserStore';
import { useCart } from '../stores/CartStore';

export default function Header() {

    const search = useSearch();
    const [location, navigate] = useLocation();
    const params = new URLSearchParams(search);

    // current active category
    const activeCategoryId = params.get('categoryId');
    // what the customer is typing in the search box
    const [searchText, setSearchText] = useState(params.get('search') || '');
    // show the search words when the address bar changes

    // the logged-in customer (null = nobody), shared with the login form through the Jotai atom
    const { user, clearLogin } = useUser();
    const { cart, fetchCart } = useCart();

    // load the cart when the app starts, and again whenever someone logs in or out
    // (logged in → the saved cart; guest → the localStorage cart), so the badge is right after F5
    useEffect(() => {
        const loadCart = async () => {
            try {
                await fetchCart();
            } catch (err) {
                console.error(err); // the badge just stays empty; the cart page shows the real error
            }
        };
        loadCart();
    }, [user]);


    // Log out: tell the server to revoke the refresh token, then forget everything in the browser
    async function logOut() {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            if (refreshToken) {
                await api.post('/auth/logout', { refreshToken }); // 204: the token can no longer get new access tokens
            }
        } catch (e) {
            console.error(e); // even if the server is down, still log out in this browser below
        }
        navigate('/');  // leave the page first
        clearLogin();   // removes the tokens and the user, sets the atom to null
    }


    useEffect(() => {
        setSearchText(new URLSearchParams(search).get('search') || '');
    }, [search]);

    // Enter in the search box: a NEW search across all products (category and filters are dropped, like the menu links)
    function submitSearch(event) {
        event.preventDefault(); // stop the normal form behaviour (a full page reload)
        const words = searchText.trim();
        if (words === '') {
            navigate('/products'); // empty box: show everything
            return;
        }
        const newParams = new URLSearchParams();
        newParams.set('search', words); // URLSearchParams makes "&" or spaces safe in the URL
        navigate('/products?' + newParams.toString());
    }


    return (
        <header>
            {/* navy strip at the very top */}
            <div className="kg-banner">FREE DELIVERY ON ORDERS OF 15+ ITEMS</div>

            {/* white bar: logo on the left, account and cart on the right */}
            <div className="kg-header-main">
                <div className="container d-flex flex-wrap align-items-center gap-3 py-3">
                    <Link href="/" className="kg-logo">kitgrid彡</Link>
                    <form className="kg-search" role="search" onSubmit={submitSearch}>
                        <input type="search" className="form-control" placeholder="Search kits or gear..."
                            aria-label="Search products" maxLength={100}
                            value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                    </form>
                    {/* ms-auto pushes these to the right edge */}
                    <div className="d-flex align-items-center gap-3 gap-md-4 ms-auto ms-lg-0">
                        {user ? (
                            <>
                                <Link href="/orders" className="kg-header-link" aria-label="My Orders">
                                    <span className="bi bi-bag kg-header-icon" aria-hidden="true"></span>
                                </Link>
                                <div className="dropdown">
                                    <button type="button" className="kg-header-link kg-header-button"
                                        data-bs-toggle="dropdown" aria-expanded="false" aria-label="Account Menu">
                                        <span className="bi bi-person kg-header-icon" aria-hidden="true"></span>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <li><span className="dropdown-item-text kg-header-user">{user.name}</span></li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button type="button" className="dropdown-item d-flex justify-content-between" onClick={logOut}>
                                                Log Out<span className="bi bi-box-arrow-right" aria-hidden="true"></span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <Link href="/login" className="kg-header-link" aria-label="Log in / Register">
                                <span className="bi bi-person kg-header-icon" aria-hidden="true"></span>
                            </Link>
                        )}

                        {/* the badge shows how many products are in the cart (like the wireframe), hidden when empty */}
                        <Link href="/cart" className="kg-header-link kg-header-cart" aria-label={'Cart, ' + cart.products.length + ' products'}>
                            <span className="bi bi-cart3 kg-header-icon" aria-hidden="true"></span>
                            {cart.products.length > 0 && <span className="kg-cart-badge">{cart.products.length}</span>}
                        </Link>

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
