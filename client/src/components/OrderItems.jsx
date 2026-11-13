// a read-only list of products, grouped like the cart: one block per product, one row per size
// used on the checkout review, and later on the confirmation and order detail pages
// products: from GET /api/cart or GET /api/orders/:id (both have the same fields used here)
import './OrderItems.css';

export default function OrderItems({ products }) {
    return (
        <>
            {products.map(product => (
                <div key={product.productId} className="kg-order-product">
                    <div className="d-flex justify-content-between align-items-baseline mb-2">
                        <div className="kg-order-name">{product.name}</div>
                        <div className="kg-card-meta">{product.totalQuantity} units</div>
                    </div>

                    <table className="table table-sm kg-order-table mb-2">
                        <thead>
                            <tr>
                                <th scope="col">Size</th>
                                <th scope="col" className="text-end">Qty</th>
                                <th scope="col" className="text-end">Line total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {product.lines.map(line => (
                                <tr key={line.variantId}>
                                    <td>
                                        {line.colour} · {line.size}
                                        {/* some sizes have no age group (null), then nothing is shown */}
                                        {line.ageGroup && <span className="kg-card-meta"> ({line.ageGroup})</span>}
                                    </td>
                                    <td className="text-end">{line.quantity}</td>
                                    <td className="text-end">S${line.lineTotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {product.discount > 0 && (
                        <div className="kg-order-row kg-checkout-discount">
                            <span>{product.discountPercent}% bulk discount</span>
                            <span>−S${product.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="kg-order-row fw-semibold">
                        <span>Product total</span>
                        <span>S${product.total.toFixed(2)}</span>
                    </div>
                </div>
            ))}
        </>
    );
}
