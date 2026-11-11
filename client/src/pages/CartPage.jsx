// the cart page (/cart): the products in the cart and the order summary
// the cart comes from the cart store, so this page works the same for guests and logged-in customers
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useCart } from '../stores/CartStore';
import { useUser } from '../stores/UserStore';
import Breadcrumb from '../components/Breadcrumb';
import CartProductCard from '../components/CartProductCard';

export default function CartPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notSold, setNotSold] = useState(false); // true when a guest's cart holds a product that is no longer sold
    const [updating, setUpdating] = useState(false); // true while a quantity change or Remove is saving
    const [updateError, setUpdateError] = useState('');
    const { cart, fetchCart, clearGuestCart, modifyQuantity, removeProduct } = useCart();
    const { user } = useUser();

    // load a fresh cart when the page opens (stock and prices may have changed since the items were added),
    // and again if someone logs in or out while on this page
    useEffect(() => {
        const loadCart = async () => {
            setLoading(true);
            setError('');
            setNotSold(false);
            try {
                await fetchCart();
            } catch (err) {
                if (!user && err.response && err.response.status === 404) {
                    // the quote said "Variant X not found": the admin hid that product after the guest added it
                    setNotSold(true);
                } else {
                    setError("Couldn't load your cart. Please check your connection and try again.");
                }
            }
            setLoading(false);
        };
        loadCart();
    }, [user]);

    // the "Empty my cart" button (only shown with the "no longer sold" message)
    function handleEmptyCart() {
        clearGuestCart();
        setNotSold(false); // the empty cart message shows instead
    }

    // a quantity box was changed; answers true/false so the box knows whether to put the old number back
    async function handleQuantityChange(variantId, quantity) {
        setUpdating(true);
        setUpdateError('');
        let saved = true;
        try {
            await modifyQuantity(variantId, quantity);
        } catch (err) {
            setUpdateError(err.response ? err.response.data.error : 'Cannot reach the server. Please try again later.');
            saved = false;
        }
        setUpdating(false);
        return saved;
    }

    // the Remove button on a product card
    async function handleRemove(product) {
        setUpdating(true);
        setUpdateError('');
        try {
            await removeProduct(product);
        } catch (err) {
            setUpdateError(err.response ? err.response.data.error : 'Cannot reach the server. Please try again later.');
        }
        setUpdating(false);
    }


    const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'Cart' }];

    // early returns: after all the hooks above
    if (loading) {
        return <p className="kg-card-meta">Loading your cart…</p>;
    }

    if (notSold) {
        return (
            <div className="alert alert-warning">
                Something in your cart is no longer sold, so we couldn't work out the prices.
                <button type="button" className="btn btn-kg-dark btn-sm ms-2" onClick={handleEmptyCart}>
                    Empty my cart
                </button>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (cart.products.length === 0) {
        return (
            <>
                <Breadcrumb items={breadcrumbItems} />
                <div className="kg-card p-5 text-center">
                    <h1 className="h3">Your cart is empty</h1>
                    <p className="kg-card-meta">Pick a product, type a quantity for each size and add them all at once.</p>
                    <Link href="/products" className="btn btn-kg-primary">Browse products</Link>
                </div>
            </>
        );
    }

    // is any size asking for more than the stock? then checkout is blocked until it's lowered
    let hasStockProblem = false;
    for (const product of cart.products) {
        for (const line of product.lines) {
            if (line.quantity > line.stock) {
                hasStockProblem = true;
            }
        }
    }
    
    return (
        <>
            <Breadcrumb items={breadcrumbItems} />

            {/* "Your cart  2 products · 30 units" */}
            <div className="d-flex align-items-baseline flex-wrap gap-2 mb-3">
                <h1 className="mb-0">Your cart</h1>
                <span className="kg-card-meta">
                    {cart.products.length} {cart.products.length === 1 ? 'product' : 'products'} · {cart.totalUnits} units
                </span>
            </div>

            {hasStockProblem && (
                <div className="alert alert-warning">
                    Some sizes ask for more than we have in stock. Please lower the quantities marked in red before you check out.
                </div>
            )}
            { updateError && <div className="alert alert-danger">{updateError}</div> }

            <div className="row g-4">
                {/* left: one card per product */}
                <div className="col-lg-8">
                    {cart.products.map(product => (
                        <CartProductCard key={product.productId} product={product} disabled={updating}
                        onQuantityChange={handleQuantityChange} onRemove={handleRemove}/>
                    ))}
                </div>

                {/* right (below on phones): the order summary. No shipping here: delivery is chosen at checkout */}
                <div className="col-lg-4">
                    <div className="kg-summary">
                        <h2 className="h5 text-white mb-3">Order summary</h2>
                        <div className="kg-summary-row">
                            <span>Items</span>
                            <span>{cart.totalUnits} units</span>
                        </div>
                        <div className="kg-summary-row">
                            <span>Subtotal</span>
                            <span>S${cart.subtotal.toFixed(2)}</span>
                        </div>
                        {cart.discount > 0 && (
                            <div className="kg-summary-row kg-summary-discount">
                                <span>Bulk discounts</span>
                                <span>−S${cart.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="kg-summary-row kg-summary-total">
                            <span>Total</span>
                            <strong>S${cart.total.toFixed(2)}</strong>
                        </div>
                    </div>

                    {/* a Link can't be disabled, so show a disabled button while there's a stock problem
                        guests go to the login page first (step 4 keeps their cart) */}
                    {hasStockProblem ? (
                        <button type="button" className="btn btn-kg-primary w-100 mt-3 py-2" disabled>
                            Proceed to checkout
                        </button>
                    ) : (
                        <Link href={user ? '/checkout' : '/login'} className="btn btn-kg-primary w-100 mt-3 py-2">
                            Proceed to checkout
                        </Link>
                    )}

                    {!user && (
                        <p className="kg-card-meta text-center mt-2 mb-0">You'll log in or register first. Your cart is kept.</p>
                    )}

                    <div className="text-center mt-3">
                        <Link href="/products">← Continue shopping</Link>
                    </div>
                </div>
            </div>
        </>
    );
}
