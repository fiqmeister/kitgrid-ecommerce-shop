// the "Order total" card of a SAVED order: items, subtotal, bulk discounts, delivery and total
// used by the confirmation page and the order detail page
// (not CheckoutSummary: that one works out the totals from a cart; this one shows the totals saved with the order)
// the kg-checkout-row styles come from CheckoutSummary.css

// order: the saved order from GET /api/orders/:id
export default function OrderTotal({ order }) {
    return (
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
    );
}
