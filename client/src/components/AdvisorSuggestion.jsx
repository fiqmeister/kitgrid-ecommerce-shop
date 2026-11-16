// the Kit Advisor's suggested kit: products, bulk discount, delivery, total and "Add all to cart"
// every number comes from our server's quote (POST /api/advisor re-prices the AI's items), never from the AI's words
// the styles are in KitAdvisor.css: this card is only used inside the Kit Advisor panel
import { useState } from 'react';
import { Link } from 'wouter';
import { useCart } from '../stores/CartStore';

// suggestion: { title, items: [{ variantId, quantity }], products: [...], totalUnits, subtotal, discount, deliveryFee, total }
// each product is in the same shape as a cart product: { productId, name, lines: [{ variantId, size, colour, quantity, ... }], subtotal, ... }
export default function AdvisorSuggestion({ suggestion }) {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false); // true while the cart request is on its way
    const [isAdded, setIsAdded] = useState(false);   // true once the kit is in the cart
    const [error, setError] = useState('');

    // the same addToCart as the product page: it takes [{ variantId, quantity }]
    // logged in, so it uses /cart/merge: each quantity is added on top of the cart, capped at the stock
    const addAll = async () => {
        setIsAdding(true);
        setError('');
        try {
            await addToCart(suggestion.items);
            setIsAdded(true);
        } catch (err) {
            if (err.response) {
                setError(err.response.data.error);
            } else {
                setError('Cannot reach the server. Please try again later.');
            }
        }
        setIsAdding(false);
    };

    return (
        <div className="kg-advisor-card">
            {/* title and a green "In stock" chip (the server dropped the suggestion if anything was out of stock) */}
            <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                <h3 className="kg-advisor-card-title">{suggestion.title}</h3>
                <span className="kg-advisor-stock">In stock</span>
            </div>

            {/* one row per product: the name and its price before the bulk discount,
                then its sizes in one line, e.g. "Navy Youth S × 5 · Navy Youth M × 5" */}
            {suggestion.products.map(product => (
                <div key={product.productId} className="kg-advisor-product">
                    <div className="d-flex justify-content-between gap-2">
                        <strong>{product.name}</strong>
                        <span>S${product.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="kg-advisor-product-meta">
                        {product.lines.map(line => line.colour + ' ' + line.size + ' × ' + line.quantity).join(' · ')}
                    </div>
                </div>
            ))}

            {/* the totals: products − bulk discounts + delivery = total */}
            <div className="kg-advisor-totals">
                {suggestion.discount > 0 && (
                    <div className="kg-advisor-row kg-advisor-discount">
                        <span>Bulk discounts</span>
                        <span>−S${suggestion.discount.toFixed(2)}</span>
                    </div>
                )}
                <div className="kg-advisor-row">
                    <span>Delivery</span>
                    <span>{suggestion.deliveryFee === 0 ? 'FREE' : 'S$' + suggestion.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="kg-advisor-row kg-advisor-total">
                    <span>Total ({suggestion.totalUnits} {suggestion.totalUnits === 1 ? 'unit' : 'units'})</span>
                    <span>S${suggestion.total.toFixed(2)}</span>
                </div>
            </div>

            {/* after adding: a tick and a link to the cart, so the button can't add the kit twice by mistake */}
            {isAdded ? (
                <div className="d-flex align-items-center gap-3 mt-3">
                    <span className="kg-advisor-added">✓ Added to cart</span>
                    <Link href="/cart" className="kg-advisor-link">View cart</Link>
                </div>
            ) : (
                <button type="button" className="btn btn-kg-primary w-100 mt-3" onClick={addAll} disabled={isAdding}>
                    {isAdding ? 'Adding…' : 'Add all to cart'}
                </button>
            )}
            {error && <p className="kg-advisor-card-error mt-2 mb-0" role="alert">{error}</p>}
        </div>
    );
}
