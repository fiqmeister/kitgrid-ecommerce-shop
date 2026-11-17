// one order in full: /orders/:id (from "View details" on My orders)
// it loads the saved order from GET /api/orders/:id; another customer's order gets 404, like the confirmation page
import { useState, useEffect } from 'react';
import { Link, Redirect } from 'wouter';
import api from '../api';
import { useUser } from '../stores/UserStore';
import Breadcrumb from '../components/Breadcrumb';
import OrderStatusChip from '../components/OrderStatusChip';
import OrderTimeline from '../components/OrderTimeline';
import OrderItems from '../components/OrderItems';
import OrderTotal from '../components/OrderTotal';
import PageState from '../components/PageState';


export default function OrderDetailPage({ params }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notFound, setNotFound] = useState(false); // true for a 404/400: no such order (or another customer's), so Try again wouldn't help
    const [reloadCount, setReloadCount] = useState(0); // Try again adds 1 to this number; useEffect is watching it, so it loads the order again

    const { user } = useUser();

    useEffect(() => {
        const loadOrder = async () => {
            if (!user) {
                setLoading(false); // guests are sent to the login page below
                return;
            }
            setLoading(true);
            setError('');
            setNotFound(false);
            try {
                const response = await api.get('/orders/' + params.id);
                setOrder(response.data);
            } catch (err) {
                // 404: no such order, or another customer's; 400: the id is not a number (e.g. /orders/abc)
                if (err.response && (err.response.status === 404 || err.response.status === 400)) {
                    setNotFound(true);
                } else {
                    setError("Couldn't load your order. Please check your connection and try again.");
                }
            }
            setLoading(false);
        };
        loadOrder();
    }, [params.id, user, reloadCount]);

    // early returns: after all the hooks above
    if (!user) {
        return <Redirect to="/login" replace />; // protected page, same bouncer as My orders
    }

    if (loading) {
        return (
            <p className="kg-card-meta">
                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                Loading your order…
            </p>
        );
    }

    if (notFound) {
        return (
            <PageState icon="bi-search" title="We couldn't find this order" text="Check the order number, or find it in your orders.">
                <Link href="/orders" className="btn btn-kg-primary">Back to my orders</Link>
            </PageState>
        );
    }

    if (error) {
        return (
            <PageState icon="bi-exclamation-lg" title="We couldn't load your order" text="Check your connection and try again." isError={true}>
                <button type="button" className="btn btn-kg-primary" onClick={() => setReloadCount(reloadCount + 1)}>
                    Try again
                </button>
            </PageState>
        );
    }


    // createdAt arrives as text in the JSON, so turn it back into a date
    const placedAt = new Date(order.createdAt).toLocaleString('en-SG', {
        day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
    });

    return (
        <>
            <Breadcrumb items={[
                { label: 'Home', href: '/' },
                { label: 'My orders', href: '/orders' },
                { label: 'Order #' + order.id },
            ]} />

            {/* the order number with its status, then the date and units */}
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                <h1 className="fs-2 mb-0">Order #{order.id}</h1>
                <OrderStatusChip status={order.status} />
            </div>
            <p className="kg-card-meta mb-4">Placed {placedAt} · {order.totalUnits} units</p>

            <div className="row g-4">
                {/* ---------- left: progress and items ---------- */}
                <div className="col-lg-8">
                    <div className="kg-card p-4 mb-4">
                        <h2 className="h5 mb-3">Order progress</h2>
                        <OrderTimeline status={order.status} history={order.history} />
                    </div>

                    <div className="kg-card p-4">
                        <h2 className="h5 mb-3">Items</h2>
                        <OrderItems products={order.products} />
                    </div>
                </div>

                {/* ---------- right: totals, delivery and the way back ---------- */}
                <div className="col-lg-4">
                    <OrderTotal order={order} />

                    <div className="kg-card p-4 mb-4">
                        <h2 className="h5 mb-3">Delivering to</h2>
                        <p className="mb-1 fw-semibold">
                            {order.delivery.recipientName} · +65 {order.delivery.phone}
                        </p>
                        <p className="mb-2">
                            {order.delivery.addressLine1}
                            {order.delivery.unitNumber && ', #' + order.delivery.unitNumber}
                            {order.delivery.addressLine2 && ', ' + order.delivery.addressLine2}
                            , Singapore {order.delivery.postalCode}
                        </p>
                        <p className="kg-card-meta mb-0">Standard delivery</p>
                    </div>

                    <Link href="/orders" className="kg-checkout-link">← Back to my orders</Link>
                </div>
            </div>
        </>
    );
}
