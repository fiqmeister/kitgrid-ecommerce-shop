// the order summary on the right of the checkout (below the form on phones)
// cart: the priced cart from the cart store; deliveryFee: from deliveryFee.js
// showProducts: true on the Delivery step (a short product list, like the wireframe), false on Review
import { Link } from 'wouter';
import roundMoney from '../roundMoney';
import { freeDeliveryUnits } from '../deliveryFee';
import './CheckoutSummary.css';

export default function CheckoutSummary({ cart, deliveryFee, showProducts }) {
    const total = roundMoney(cart.total + deliveryFee); // the cart total (after bulk discounts) + delivery

    return (
        <div className="kg-card p-4">
            <div className="d-flex justify-content-between align-items-baseline mb-3">
                <h2 className="h5 mb-0">{showProducts ? 'Order summary' : 'Order total'}</h2>
                <Link href="/cart" className="kg-checkout-link">Edit cart</Link>
            </div>

            {showProducts && (
                <div className="kg-checkout-products">
                    {cart.products.map(product => (
                        <div key={product.productId} className="d-flex align-items-center gap-2 mb-2">
                            <div className="kg-checkout-thumb"></div>
                            <div className="flex-grow-1">
                                <div className="kg-checkout-name">{product.name}</div>
                                <div className="kg-card-meta">{product.totalQuantity} units</div>
                            </div>
                            <div className="fw-semibold">S${product.total.toFixed(2)}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="kg-checkout-row">
                <span>Items</span>
                <span>{cart.totalUnits} units</span>
            </div>
            <div className="kg-checkout-row">
                <span>Subtotal</span>
                <span>S${cart.subtotal.toFixed(2)}</span>
            </div>
            {cart.discount > 0 && (
                <div className="kg-checkout-row kg-checkout-discount">
                    <span>Bulk discounts</span>
                    <span>−S${cart.discount.toFixed(2)}</span>
                </div>
            )}
            <div className="kg-checkout-row">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'kg-checkout-free' : ''}>
                    {deliveryFee === 0 ? 'FREE' : 'S$' + deliveryFee.toFixed(2)}
                </span>
            </div>
            {/* how far from free delivery, e.g. 9 units → "Add 6 more items for free delivery." */}
            {deliveryFee > 0 && (
                <div className="kg-card-meta mb-1">
                    Add {freeDeliveryUnits - cart.totalUnits} more items for free delivery.
                </div>
            )}

            <div className="kg-checkout-row kg-checkout-total">
                <span>Total</span>
                <strong>S${total.toFixed(2)}</strong>
            </div>
        </div>
    );
}
