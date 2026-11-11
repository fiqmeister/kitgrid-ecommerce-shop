// one product in the cart: its sizes (each with its colour), the bulk discount and the product total
// product = one item of cart.products, e.g.
// { productId: 1, name: 'Matchday Jersey', unitPrice: 38, totalQuantity: 18, lines: [...],
//   subtotal: 684, discountPercent: 15, discount: 102.6, total: 581.4, nextTier: { ... } or null }
import { Link } from 'wouter';
import ageGroupLabels from '../ageGroups';
import './CartProductCard.css';
import CartQuantity from './CartQuantity';

export default function CartProductCard({ product, disabled, onQuantityChange, onRemove }) {
    return (
        <div className="kg-card p-3 p-md-4 mb-3">

            {/* top: image, name (links back to the product page), units, discount chip */}
            <div className="d-flex gap-3 mb-3">
                <div className="kg-cart-image">[ image ]</div>
                <div>
                    <h2 className="kg-card-title">
                        <Link href={'/products/' + product.productId} className="kg-cart-name">{product.name}</Link>
                    </h2>
                    <div className="kg-card-meta mb-2">{product.totalQuantity} units</div>
                    {/* only when a tier is reached (never for products without bulk discounts) */}
                    {product.discountPercent > 0 && (
                        <span className="kg-discount-chip">{product.discountPercent}% bulk discount applied</span>
                    )}
                </div>
                {/* ms-auto pushes it to the right, align-self-start keeps it at the top */}
                <button
                    type="button"
                    className="btn btn-link kg-cart-remove ms-auto align-self-start"
                    onClick={() => onRemove(product)}
                    disabled={disabled}
                >
                    Remove
                </button>
            </div>

            {/* one row per size; "In stock" and "Unit price" are hidden on phones (d-none d-md-table-cell)
                and shown as a small line under the size instead, like the mobile wireframe */}
            <table className="table kg-cart-table align-middle mb-0">
                <thead>
                    <tr>
                        <th scope="col">Size</th>
                        <th scope="col" className="d-none d-md-table-cell">In stock</th>
                        <th scope="col" className="d-none d-md-table-cell">Unit price</th>
                        <th scope="col" className="text-center">Quantity</th>
                        <th scope="col" className="text-end">Line total</th>
                    </tr>
                </thead>
                <tbody>
                    {product.lines.map(line => (
                        <tr key={line.variantId}>
                            <td>
                                <strong>{line.colour} · {line.size}</strong>
                                {/* some sizes have no age group (null), so only show it when there is one */}
                                {line.ageGroup && <div className="kg-card-meta">{ageGroupLabels[line.ageGroup]}</div>}
                                <div className="kg-card-meta d-md-none">
                                    S${product.unitPrice.toFixed(2)} each · {line.stock} in stock
                                </div>
                                {/* more in the cart than in stock (a guest added the same size twice,
                                    or the stock went down after it was added) */}
                                {line.quantity > line.stock && (
                                    <div className="kg-cart-warning">Only {line.stock} in stock</div>
                                )}
                            </td>
                            <td className="d-none d-md-table-cell">{line.stock}</td>
                            <td className="d-none d-md-table-cell">S${product.unitPrice.toFixed(2)}</td>
                            <td className="text-center">
                                <CartQuantity
                                    quantity={line.quantity}
                                    stock={line.stock}
                                    label={product.name + ' ' + line.colour + ' ' + line.size}
                                    disabled={disabled}
                                    onUpdateValue={(newQuantity) => onQuantityChange(line.variantId, newQuantity)}
                                />
                            </td>

                            <td className="text-end fw-semibold">S${line.lineTotal.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="kg-card-meta mt-2">Enter 0 to remove a size.</div>
            {/* the product's bulk discount (one for all its sizes) and its total */}
            <div className="kg-cart-totals">
                {product.discount > 0 && (
                    <div className="kg-cart-total-row kg-cart-discount">
                        <span>Bulk discount ({product.discountPercent}% on {product.totalQuantity} units)</span>
                        <span>−S${product.discount.toFixed(2)}</span>
                    </div>
                )}
                <div className="kg-cart-total-row">
                    <span className="fw-semibold">Product total</span>
                    <strong className="kg-cart-product-total">S${product.total.toFixed(2)}</strong>
                </div>
            </div>

            {/* the next tier from the server, e.g. { minQuantity: 15, discountPercent: 15, unitsNeeded: 3 }
                null when the top tier is reached or the product has no bulk discounts */}
            {product.nextTier && (
                <div className="kg-next-tier">
                    Add {product.nextTier.unitsNeeded} more for {product.nextTier.discountPercent}% off this item.
                </div>
            )}
        </div>
    );
}
