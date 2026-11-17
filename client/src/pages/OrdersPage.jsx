// My orders (/orders): the logged-in customer's orders, newest first, 5 per page
// the search words and the page number live in the address bar, like the product list: /orders?search=bib&page=2
import { useState, useEffect } from 'react';
import { Link, Redirect, useSearch, useLocation } from 'wouter';
import api from '../api';
import { useUser } from '../stores/UserStore';
import OrderStatusChip from '../components/OrderStatusChip';
import Pagination from '../components/Pagination';
import PageState from '../components/PageState';
import './OrdersPage.css';

export default function OrdersPage() {
    const { user } = useUser();
    const search = useSearch(); // the text after "?", e.g. "search=bib&page=2" ("" when there is none)
    const [location, navigate] = useLocation();
    const params = new URLSearchParams(search);
    const searchWords = params.get('search') || ''; // the search that is already in the URL

    // what the customer is typing in the search box (starts with the words already in the URL)
    const [searchText, setSearchText] = useState(searchWords);

    const [result, setResult] = useState(null);   // { items, page, limit, total, totalPages } from the API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadCount, setReloadCount] = useState(0); // Try again adds 1 to this number; useEffect is watching it, so it loads the orders again


    // load the orders for whatever is in the address bar
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) {
                setLoading(false); // guests are sent to the login page below
                return;
            }
            setLoading(true);
            setError('');
            try {
                // the same text goes straight to the API: /orders?search=bib → GET /api/orders?search=bib
                const response = await api.get('/orders?' + search);
                setResult(response.data);
            } catch (err) {
                setError("Couldn't load your orders. Please check your connection and try again.");
            }
            setLoading(false);
        };
        fetchOrders();
    }, [search, user, reloadCount]); // again when the search or page changes, or when Try again is clicked

    // keep the box in step with the URL (e.g. after "Show all orders" or the browser Back button)
    useEffect(() => {
        setSearchText(new URLSearchParams(search).get('search') || '');
    }, [search]);

    // Enter in the search box: a NEW search, so start again at page 1 (no "page" in the new URL)
    function submitSearch(event) {
        event.preventDefault(); // stop the normal form behaviour (a full page reload)
        const words = searchText.trim();
        if (words === '') {
            navigate('/orders'); // empty box: show every order
            return;
        }
        const newParams = new URLSearchParams();
        newParams.set('search', words); // URLSearchParams makes "#" or spaces safe in the URL
        navigate('/orders?' + newParams.toString());
    }

    // early returns: after all the hooks above
    if (!user) {
        return <Redirect to="/login" replace />; // protected page, same bouncer as the checkout
    }

    // 4 states: loading, error, nothing found, the list
    let content;
    if (loading) {
        content = (
            <p className="kg-card-meta">
                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                Loading your orders…
            </p>
        );
    } else if (error) {
        content = (
            <PageState icon="bi-exclamation-lg" title="We couldn't load your orders" text="Check your connection and try again." isError={true}>
                <button type="button" className="btn btn-kg-primary" onClick={() => setReloadCount(reloadCount + 1)}>
                    Try again
                </button>
            </PageState>
        );
    } else if (result.items.length === 0 && searchWords) {
        // a search found nothing
        content = (
            <PageState icon="bi-search" title={'No orders match "' + searchWords + '"'} text="Try an order number (e.g. 1006) or a product name.">
                <Link href="/orders" className="btn btn-kg-primary">Show all orders</Link>
            </PageState>
        );
    } else if (result.items.length === 0) {
        // no search, and still nothing: this customer has never ordered
        content = (
            <PageState icon="bi-bag" title="You haven't placed any orders yet" text="Your orders will appear here after checkout.">
                <Link href="/products" className="btn btn-kg-primary">Start shopping</Link>
            </PageState>
        );

    } else {
        content = (
            <>
                {result.items.map(order => {
                    // createdAt arrives as text in the JSON: turn it into a date, e.g. "30 Sept 2026"
                    const placedOn = new Date(order.createdAt).toLocaleDateString('en-SG', {
                        day: 'numeric', month: 'short', year: 'numeric',
                    });
                    // e.g. "Training Bib × 10, Match Football × 2"
                    const productsText = order.products.map(product => product.name + ' × ' + product.quantity).join(', ');

                    return (
                        <div className="kg-card p-4 mb-3 d-flex flex-wrap justify-content-between gap-3" key={order.id}>
                            {/* left: number, date, units and products */}
                            <div>
                                <h2 className="h5 mb-1">Order #{order.id}</h2>
                                <div className="kg-card-meta mb-1">Placed {placedOn} · {order.totalUnits} units</div>
                                <div>{productsText}</div>
                            </div>
                            {/* right: status, total and the link to the detail page */}
                            <div className="d-flex flex-column align-items-end gap-2">
                                <OrderStatusChip status={order.status} />
                                <div className="kg-order-total">S${order.total.toFixed(2)}</div>
                                <Link href={'/orders/' + order.id} className="btn btn-outline-secondary btn-sm">View details</Link>
                            </div>
                        </div>
                    );
                })}
                <Pagination page={result.page} limit={result.limit} total={result.total} totalPages={result.totalPages} />
            </>
        );
    }

    return (
        <>
            <h1 className="fs-2 mb-3">My orders</h1>

            {/* search on the left, the number of orders on the right */}
            <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                <form className="kg-orders-search" role="search" onSubmit={submitSearch}>
                    <input type="search" className="form-control" placeholder="Search by order number or product"
                        aria-label="Search my orders" maxLength={100}
                        value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                </form>
                {!loading && !error && (
                    <span className="kg-card-meta ms-auto">
                        {result.total} {result.total === 1 ? 'order' : 'orders'}
                    </span>
                )}
            </div>

            {content}
        </>
    );
}
