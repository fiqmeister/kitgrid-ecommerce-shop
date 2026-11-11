// the product detail page: /products/5
// step 1: loads one product and shows the top info and the "Product details" card
// the colour picker, size table, bulk tiers and totals come in the next steps
import { useState, useEffect} from 'react';
import { Link } from 'wouter';
import api from '../api';
import categories from '../categories';
import ageGroupLabels from '../ageGroups';
import './ProductDetail.css';
import Breadcrumb from '../components/Breadcrumb';
import roundMoney from '../roundMoney';
import { useCart } from '../stores/CartStore';
import { useUser } from '../stores/UserStore';

// params comes from the Route: <Route path="/products/:id" component={ProductDetail} />
// for /products/5, params is { id: "5" } (always text)
export default function ProductDetail({ params }) {
    const [product, setProduct] = useState(null); // one product from GET /api/products/:id
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedColour, setSelectedColour] = useState(''); // e.g. "Navy": which sizes the table shows
    const [quantities, setQuantities] = useState({}); // { variantId: quantity }, e.g. { 1: 4, 3: 6 }
    // for cart section
    const [adding, setAdding] = useState(false);    // true while the Add to cart request runs
    const [cartMessage, setCartMessage] = useState(''); // "Added to your cart."
    const [cartError, setCartError] = useState('');
    const { addToCart } = useCart();
    const { user } = useUser();


    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError('');
            try {
                // /products/5 → GET /api/products/5
                const response = await api.get('/products/' + params.id);
                setProduct(response.data);
                setSelectedColour(response.data.colours[0]); //start on the 1st colour
                setQuantities({}); // a new product starts with nothing typed
                setCartMessage(''); // don't show the last product's message on a new product
                setCartError('');

            } catch (err) {
                // 404 = no such product (or hidden by the admin), 400 = the id is not a number (/products/abc)
                if (err.response && (err.response.status === 404 || err.response.status === 400)) {
                    setError('Sorry, we could not find this product.');
                } else {
                    setError("Couldn't load this product. Please check your connection and try again.");
                }
            }
            setLoading(false);
        };
        fetchProduct();
    }, [params.id]); // runs again if the customer goes from one product straight to another
        // runs every time the customer types in a quantity box
    // variant: the size row, e.g. { id: 1, size: 'S', stock: 12, ... }   text: what is in the box, e.g. "4" or ""
    function changeQuantity(variant, text) {
        let quantity = Math.floor(Number(text)); // "" → 0, "2.5" → 2
        if (quantity < 0) {
            quantity = 0;
        }
        if (quantity > variant.stock) {
            quantity = variant.stock; // can't order more than we have
        }
        // copy the object, change one size, save the copy (React re-renders only for a NEW object)
        const newQuantities = { ...quantities };
        newQuantities[variant.id] = quantity;
        setQuantities(newQuantities);
    }

    // IMPORTANT: every useState/useEffect must stay ABOVE these early returns
    // (React needs the same hooks, in the same order, on every render)
    if (loading) {
        return <p className="kg-card-meta">Loading product…</p>;
    }
    if (error) {
        return (
            <div className="text-center py-5">
                <h1 className="fs-3">{error}</h1>
                <Link href="/products" className="btn btn-kg-primary mt-2">Back to all products</Link>
            </div>
        );
    }

    // the category's id, for the breadcrumb link (the API sends the name, e.g. "Matchday Kits")
    const category = categories.find(item => item.name === product.category);
    // the breadcrumb links: Home / category / this product (the category is skipped if it isn't found)
    const breadcrumbItems = [{ label: 'Home', href: '/' }];
    if (category) {
        breadcrumbItems.push({ label: category.name, href: '/products?categoryId=' + category.id });
    }
    breadcrumbItems.push({ label: product.name });


    // "Yes (10+ units)": bulkTiers[0] is the Standard price, bulkTiers[1] is the first discount
    let bulkText = 'No';
    if (product.bulkTiers.length > 1) {
        bulkText = 'Yes (' + product.bulkTiers[1].minQuantity + '+ units)';
    }

    // "Senior, Youth (U10–U16)": or a dash when the product has no age groups (e.g. Marker Cones)
    let ageGroupText = '—';
    if (product.ageGroups.length > 0) {
        ageGroupText = product.ageGroups.map(group => ageGroupLabels[group]).join(', ');
    }
    // only the sizes of the chosen colour, e.g. the 10 Navy rows of the Matchday Jersey
    const sizeRows = product.variants.filter(variant => variant.colour === selectedColour);

    // ---- the summary box: the same maths as the server's cart ----
    // add up every box, across ALL sizes and colours: the bulk tier counts the whole product
    let totalUnits = 0;
    for (const variant of product.variants) {
        totalUnits += quantities[variant.id] || 0; // a size not typed in is undefined → counts as 0
    }

    // the highest tier reached: tiers come sorted lowest first, so the last match wins
    // stays null for 0 units, and for products without bulk discounts (their bulkTiers is [])
    let currentTier = null;
    for (const tier of product.bulkTiers) {
        if (totalUnits >= tier.minQuantity) {
            currentTier = tier;
        }
    }
    const discountPercent = currentTier ? currentTier.discountPercent : 0;

    const subtotal = roundMoney(product.basePrice * totalUnits);       // before discount
    const discount = roundMoney(subtotal * discountPercent / 100);     // one discount for the whole product
    const total = roundMoney(subtotal - discount);

    // "Add all selected to cart": every size with a quantity, across all colours, in one go
    async function handleAddToCart() {
        const items = [];
        for (const variant of product.variants) {
            const quantity = quantities[variant.id] || 0;
            if (quantity > 0) {
                items.push({ variantId: variant.id, quantity: quantity }); // empty sizes are left out
            }
        }

        setAdding(true);
        setCartMessage('');
        setCartError('');
        try {
            await addToCart(items);
            setCartMessage('Added to your cart.');
            setQuantities({}); // empty the boxes, ready for the next colour or product
        } catch (err) {
            setCartError(err.response ? err.response.data.error : 'Cannot reach the server. Please try again later.');
        }
        setAdding(false);
    }

    return (
        <>
            {/* Home / Matchday Kits / Matchday Jersey */}
            <Breadcrumb items={breadcrumbItems} />

            {/* image on the left, info on the right; on phones the image sits on top */}
            <div className="row g-4">
                <div className="col-lg-6">
                    {/* grey box until products have images (same as the wireframe) */}
                    <div className="kg-detail-image">[ {product.name} ]</div>
                </div>

                <div className="col-lg-6">
                    <h1 className="mb-1">{product.name}</h1>
                    <p className="kg-card-meta mb-2">{product.category}</p>

                    <p className="kg-detail-price mb-1">
                        S${product.basePrice.toFixed(2)} <span className="kg-card-unit">/ unit</span>
                    </p>

                    {product.totalStock > 0
                        ? <p className="kg-stock-in">● In stock · {product.totalStock} units across all sizes</p>
                        : <p className="kg-stock-out">Out of stock</p>}

                    {/* the bulk tier boxes: hidden for products without bulk discounts (e.g. Coach Padded Jacket) */}
                    {product.bulkTiers.length > 1 && (
                        <>
                            <p className="kg-detail-label mt-4 mb-2">Bulk discounts</p>
                            {/* 2 boxes per row on phones, 4 in one row from tablets up */}
                            <div className="row row-cols-2 row-cols-sm-4 g-2 mb-1">
                                {product.bulkTiers.map((tier, index) => {
                                    // "1–9 units" uses the next tier's minimum; the last tier has no next one → "25+ units"
                                    const nextTier = product.bulkTiers[index + 1];
                                    let range = tier.minQuantity + '+ units';
                                    if (nextTier) {
                                        range = tier.minQuantity + '–' + (nextTier.minQuantity - 1) + ' units';
                                    }
                                    return (
                                        <div className="col" key={tier.minQuantity}>
                                            {/* the tier reached gets the blue border */}
                                            <div className={tier === currentTier ? 'kg-tier kg-tier-active' : 'kg-tier'}>
                                                <div className="kg-tier-range">{range}</div>
                                                {tier.discountPercent === 0
                                                    ? <div className="kg-tier-label">Standard</div>
                                                    : <div className="kg-tier-label kg-tier-off">{tier.discountPercent}% off</div>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="kg-card-meta">Tier is based on the total units of this product, across all sizes and colours.</p>
                        </>
                    )}


                    {/* the colour picker: one round button per colour */}
                    <p className="kg-detail-label mt-4 mb-2">
                        Colour: <span className="fw-normal">{selectedColour}</span>
                    </p>
                    <div className="d-flex gap-2 mb-4">
                        {product.colours.map(colour => (
                            <button
                                key={colour}
                                type="button"
                                className={colour === selectedColour ? 'kg-swatch kg-swatch-selected' : 'kg-swatch'}
                                style={{ backgroundColor: colour }}  // "Navy", "Red"... are CSS colour names
                                onClick={() => setSelectedColour(colour)}
                                aria-label={colour}                   // screen readers say "Navy" (the button has no text)
                                aria-pressed={colour === selectedColour}
                                title={colour}                        // tooltip on hover
                            ></button>
                        ))}
                    </div>

                    {/* one row per size of the chosen colour */}
                    <h2 className="fs-5 mb-1">Squad quantities</h2>
                    <p className="kg-card-meta mb-2">
                        Enter a quantity for each size ({selectedColour}). Empty sizes are ignored.
                    </p>

                    {/* kg-card gives the table its border and rounded corners */}
                    <div className="kg-card">
                        <table className="table kg-size-table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th scope="col">Size</th>
                                    {/* the Age group column is hidden on phones to save space */}
                                    <th scope="col" className="d-none d-sm-table-cell">Age group</th>
                                    <th scope="col">Stock</th>
                                    <th scope="col" className="text-end">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sizeRows.map(variant => (
                                    <tr key={variant.id} className={variant.stock === 0 ? 'kg-size-out' : ''}>
                                        <td className="fw-semibold">{variant.size}</td>
                                        <td className="d-none d-sm-table-cell">
                                            {variant.ageGroup ? ageGroupLabels[variant.ageGroup] : '—'}
                                        </td>
                                        <td>
                                            {variant.stock > 0
                                                ? <span className="kg-stock-in">● {variant.stock} in stock</span>
                                                : <span className="kg-stock-out">✕ Out of stock</span>}
                                        </td>
                                        <td className="text-end">
                                            <input
                                                type="number"
                                                className="form-control kg-qty-input"
                                                min="0"
                                                max={variant.stock}
                                                value={quantities[variant.id] || ''}   // 0 or not typed yet → empty box
                                                onChange={event => changeQuantity(variant, event.target.value)}
                                                disabled={variant.stock === 0}
                                                aria-label={'Quantity for size ' + variant.size}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="kg-card-meta mt-2">Maximum per size is the stock available.</p>

                    {/* the navy summary box: updates on every key press */}
                    <div className="kg-summary mt-3">
                        <div className="kg-summary-row">
                            <span>Units selected</span>
                            <span>{totalUnits}</span>
                        </div>
                        <div className="kg-summary-row">
                            <span>Subtotal</span>
                            <span>S${subtotal.toFixed(2)}</span>
                        </div>
                        {/* only shown once a discount applies */}
                        {discount > 0 && (
                            <div className="kg-summary-row kg-summary-discount">
                                <span>Bulk discount ({discountPercent}%)</span>
                                <span>−S${discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="kg-summary-row kg-summary-total">
                            <span>Total</span>
                            <strong>S${total.toFixed(2)}</strong>
                        </div>
                    </div>
                    {/* disabled until at least one size has a quantity, and while the request runs */}
                    <button
                        type="button"
                        className="btn btn-kg-primary w-100 mt-3 py-2"
                        onClick={handleAddToCart}
                        disabled={totalUnits === 0 || adding}
                    >
                        {adding ? 'Adding…' : 'Add all selected to cart'}
                    </button>

                    {/* the guest note from the wireframe, only for guests */}
                    {!user && (
                        <p className="kg-card-meta text-center mt-2">You can fill your cart as a guest. Log in to check out.</p>
                    )}

                    {/* role="status" makes screen readers announce the message */}
                    {cartMessage && (
                        <div className="alert alert-success mt-3 mb-0" role="status">
                            {cartMessage} <Link href="/cart">View cart</Link>
                        </div>
                    )}
                    {cartError && <div className="alert alert-danger mt-3 mb-0">{cartError}</div>}

                </div>
            </div>

            {/* the "Product details" card under everything */}
            <section className="kg-card p-4 mt-4">
                <h2 className="fs-4">Product details</h2>
                <p>{product.description}</p>

                {/* 2 columns of facts on wide screens, 1 column on phones */}
                <div className="row">
                    <div className="col-md-6">
                        <div className="kg-spec-row">
                            <span>Material</span>
                            <strong>{product.material || '—'}</strong>
                        </div>
                        <div className="kg-spec-row">
                            <span>Weight</span>
                            <strong>{product.weightGrams ? product.weightGrams + ' g' : '—'}</strong>
                        </div>
                        <div className="kg-spec-row">
                            <span>Durability</span>
                            <strong>{product.durabilityRating ? product.durabilityRating + ' / 5' : '—'}</strong>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="kg-spec-row">
                            <span>Age groups</span>
                            <strong>{ageGroupText}</strong>
                        </div>
                        <div className="kg-spec-row">
                            <span>Colours</span>
                            <strong>{product.colours.join(', ')}</strong>
                        </div>
                        <div className="kg-spec-row">
                            <span>Bulk discounts</span>
                            <strong>{bulkText}</strong>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
