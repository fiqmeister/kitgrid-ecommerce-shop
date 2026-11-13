// the "Thank you" page after Place order: /orders/:id/confirmation
// it loads the saved order from the server (GET /api/orders/:id), not from the cart (the cart is already empty)
// the server only answers for the customer's OWN orders: another customer's id gets 404
import { useState, useEffect } from 'react';
import { Link, Redirect } from 'wouter';
import api from '../api';
import { useUser } from '../stores/UserStore';
import OrderItems from '../components/OrderItems';
import './OrderConfirmationPage.css';

// the database status → the words the customer sees
const statusLabels = {
    pending_payment: 'Pending payment',
    paid: 'Paid',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

export default function OrderConfirmationPage({ params }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useUser();

    useEffect(() => {
        const loadOrder = async () => {
            if (!user) {
                setLoading(false); // guests get the "Please log in" message below
                return;
            }
            setLoading(true);
            setError('');
            try {
                const response = await api.get('/orders/' + params.id);
                setOrder(response.data);
            } catch (err) {
                // 404: no such order, or another customer's; 400: the id is not a number (e.g. /orders/abc/...)
                if (err.response && (err.response.status === 404 || err.response.status === 400)) {
                    setError('Sorry, we could not find this order.');
                } else {
                    setError("Couldn't load your order. Please check your connection and try again.");
                }
            }
            setLoading(false);
        };
        loadOrder();
    }, [params.id, user]);

    // early returns: after all the hooks above
    if (!user) {
        return <Redirect to="/login" replace />;
    }

    if (loading) {
        return <p className="kg-card-meta">Loading your order…</p>;
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                {error} <Link href="/products">Continue shopping</Link>
            </div>
        );
    }

    // createdAt arrives as text in the JSON, so turn it back into a date, then format it like the admin pages
    const placedAt = new Date(order.createdAt).toLocaleString('en-SG', {
        day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
    });

    return (
        <>
            {/* ---------- the thank-you box ---------- */}
            <div className="kg-card p-4 mb-4 d-flex flex-wrap align-items-center gap-3">
                <div className="kg-confirm-tick" aria-hidden="true">✓</div>
                <div className="flex-grow-1">
                    <h1 className="h3 mb-1">Thank you, {user.name}. Your order is placed.</h1>
                    <p className="kg-card-meta mb-0">
                        Order #{order.id} · Placed {placedAt}
                        <span className="kg-status-chip ms-2">{statusLabels[order.status]}</span>
                    </p>
                </div>
                {/* "View my orders" is added here with the order history (14 Nov) */}
                <Link href="/products" className="btn btn-kg-primary">Continue shopping</Link>
            </div>

            <div className="row g-4">
                {/* ---------- left: the items and the delivery ---------- */}
                <div className="col-lg-8">
                    <div className="kg-card p-4 mb-4">
                        <div className="d-flex justify-content-between align-items-baseline mb-3">
                            <h2 className="h5 mb-0">Your order</h2>
                            <span className="kg-card-meta">{order.totalUnits} units</span>
                        </div>
                        <OrderItems products={order.products} />
                    </div>

                    <div className="kg-card p-4">
                        <h2 className="h5 mb-3">Delivery and payment</h2>
                        <div className="kg-card-meta">Delivering to</div>
                        <p className="mb-1 fw-semibold">
                            {order.delivery.recipientName} · +65 {order.delivery.phone}
                        </p>
                        <p className="mb-1">
                            {order.delivery.addressLine1}
                            {order.delivery.unitNumber && ', #' + order.delivery.unitNumber}
                            {order.delivery.addressLine2 && ', ' + order.delivery.addressLine2}
                            , Singapore {order.delivery.postalCode}
                        </p>
                        <p className="mb-3">
                            Standard delivery · {order.deliveryFee === 0 ? 'FREE' : 'S$' + order.deliveryFee.toFixed(2)}
                        </p>
                        <div className="kg-card-meta">Payment</div>
                        <p className="mb-0">Card payment is coming soon. This order is waiting for payment.</p>
                    </div>
                </div>

                {/* ---------- right: the totals and what happens next ---------- */}
                <div className="col-lg-4">
                    {/* the saved totals from the order (not CheckoutSummary: that one works out the total from a cart) */}
                    <div className="kg-card p-4 mb-4">
                        <h2 className="h5 mb-3">Order total</h2>
                        <div className="kg-checkout-row">
                            <span>Items</span>
                            <span>{order.totalUnits} units</span>
                        </div>
                        <div className="kg-checkout-row">
                            <span>Subtotal</span>
                            <span>S${order.subtotal.toFixed(2)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="kg-checkout-row kg-checkout-discount">
                                <span>Bulk discounts</span>
                                <span>−S${order.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="kg-checkout-row">
                            <span>Delivery</span>
                            <span className={order.deliveryFee === 0 ? 'kg-checkout-free' : ''}>
                                {order.deliveryFee === 0 ? 'FREE' : 'S$' + order.deliveryFee.toFixed(2)}
                            </span>
                        </div>
                        <div className="kg-checkout-row kg-checkout-total">
                            <span>Total</span>
                            <strong>S${order.total.toFixed(2)}</strong>
                        </div>
                    </div>

                    <div className="kg-card p-4">
                        <h2 className="h5 mb-3">What happens next</h2>
                        {/* the same for every new order for now; the order detail page (14 Nov) will follow the real status */}
                        <ol className="kg-timeline">
                            <li className="kg-timeline-done">
                                <strong>Order placed</strong>
                                <div className="kg-card-meta">Your order is saved.</div>
                            </li>
                            <li>
                                <strong>Payment</strong>
                                <div className="kg-card-meta">Card payment is coming soon.</div>
                            </li>
                            <li>
                                <strong>Processing</strong>
                                <div className="kg-card-meta">We pick and pack your kit.</div>
                            </li>
                            <li>
                                <strong>Shipped</strong>
                                <div className="kg-card-meta">Your order status changes when it's on the way.</div>
                            </li>
                            <li>
                                <strong>Delivered</strong>
                                <div className="kg-card-meta">Arrives at your Singapore address.</div>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </>
    );
}
