// the checkout (/checkout): step 1 Delivery, step 2 Review & place order
// logged-in customers only: the order is made from the cart saved in the database
import { useState, useEffect } from 'react';
import { Link, useLocation, Redirect } from 'wouter';
import { useCart } from '../stores/CartStore';
import { useUser } from '../stores/UserStore';
import api from '../api';
import CheckoutSummary from '../components/CheckoutSummary';
import getDeliveryFee from '../deliveryFee';
import './CheckoutPage.css';
import DeliveryForm from '../components/DeliveryForm';
import OrderItems from '../components/OrderItems';

export default function CheckoutPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1 = Delivery, 2 = Review & place order
    const { cart, fetchCart } = useCart();
    const { user } = useUser();
    // the delivery details: kept HERE, not in the form, so they survive going to step 2 and back
    // (the form disappears in step 2, and Formik forgets its values when it disappears)
    const [delivery, setDelivery] = useState({
        recipientName: user ? user.name : '', // filled from the account; the customer can change it
        recipientPhoneNum: '',
        postalCode: '',
        unitNumber: '',
        addressLine1: '',
        addressLine2: '',
    });

    const [placing, setPlacing] = useState(false);   // true while the order is being sent: stops a second click
    const [placeError, setPlaceError] = useState(''); // a message from the server, e.g. "Only 3 qty left for..."
    const [, setLocation] = useLocation();

    // load a fresh cart: the full Header (which normally loads it) is not shown on the checkout
    useEffect(() => {
        const loadCart = async () => {
            if (!user) {
                setLoading(false); // guests get the "Please log in" message below, no request needed
                return;
            }
            setLoading(true);
            setError('');
            try {
                await fetchCart();
            } catch (err) {
                setError("Couldn't load your cart. Please check your connection and try again.");
            }
            setLoading(false);
        };
        loadCart();
    }, [user]);
    // Continue on the delivery form: keep the values, then show step 2
    const handleContinue = (values) => {
        setDelivery(values);
        setStep(2);
    };
    // Place order: send the delivery details; the server makes the order from the saved cart
    // (it checks the stock again, works out the prices and the delivery fee, and empties the cart)
    const handlePlaceOrder = async () => {
        setPlacing(true);
        setPlaceError('');
        try {
            const response = await api.post('/orders', delivery);
            // no fetchCart here: the confirmation page shows the full Header again, and it reloads the cart (badge 0)
            setLocation('/orders/' + response.data.id + '/confirmation');
        } catch (err) {
            // 400: cart empty, a product no longer sold, not enough stock; 409: stock ran out while ordering
            if (err.response) {
                setPlaceError(err.response.data.error);
            } else {
                setPlaceError('Cannot reach the server. Please try again later.');
            }
            setPlacing(false); // turn the button back on only when it failed
        }
    };


    // early returns: after all the hooks above
    if (!user) {
        return <Redirect to="/login" replace />;
    }

    if (loading) {
        return <p className="kg-card-meta">Loading your cart…</p>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (cart.products.length === 0) {
        return (
            <div className="kg-card p-5 text-center">
                <h1 className="h3">Your cart is empty</h1>
                <p className="kg-card-meta">Add some kit before you check out.</p>
                <Link href="/products" className="btn btn-kg-primary">Browse products</Link>
            </div>
        );
    }

    // the same check as the cart page: no checkout while a size asks for more than the stock
    let hasStockProblem = false;
    for (const product of cart.products) {
        for (const line of product.lines) {
            if (line.quantity > line.stock) {
                hasStockProblem = true;
            }
        }
    }
    if (hasStockProblem) {
        return (
            <div className="alert alert-warning">
                Some sizes in your cart ask for more than we have in stock. <Link href="/cart">Back to cart</Link>
            </div>
        );
    }

    const deliveryFee = getDeliveryFee(cart.totalUnits); // 8, or 0 from 15 units

    return (
        <>
            {/* the step bar: the current step is blue, a finished step gets a green tick */}
            <div className="kg-steps mb-4">
                <div className={step === 1 ? 'kg-step kg-step-active' : 'kg-step kg-step-done'}
                    aria-current={step === 1 ? 'step' : undefined}>
                    <span className="kg-step-circle">{step === 1 ? '1' : '✓'}</span>
                    Delivery
                </div>
                <div className={step === 2 ? 'kg-step-line kg-step-line-done' : 'kg-step-line'}></div>
                <div className={step === 2 ? 'kg-step kg-step-active' : 'kg-step'}
                    aria-current={step === 2 ? 'step' : undefined}>
                    <span className="kg-step-circle">2</span>
                    Review &amp; place order
                </div>
            </div>

            <div className="row g-4">
                {/* left: the step's content (step 2 of this feature puts the delivery form here) */}
                <div className="col-lg-8">
                    {step === 1 && (
                        <DeliveryForm initialValues={delivery} email={user.email}
                            deliveryFee={deliveryFee} onContinue={handleContinue} />
                    )}
                    {step === 2 && (
                        <>
                            <div className="kg-card p-4 mb-4">
                                <div className="d-flex justify-content-between align-items-baseline mb-2">
                                    <h1 className="h5 mb-0">Delivery details</h1>
                                    {/* back to the form: the values are kept in `delivery`, so nothing is lost */}
                                    <button type="button" className="btn btn-link kg-checkout-link p-0"
                                        onClick={() => setStep(1)}>
                                        Edit
                                    </button>
                                </div>
                                <p className="mb-1 fw-semibold">{delivery.recipientName}</p>
                                <p className="mb-1">+65 {delivery.recipientPhoneNum}</p>
                                <p className="mb-1">
                                    {delivery.unitNumber && '#' + delivery.unitNumber + ', '}{delivery.addressLine1}
                                </p>
                                {delivery.addressLine2 && <p className="mb-1">{delivery.addressLine2}</p>}
                                <p className="mb-0">Singapore {delivery.postalCode}</p>
                            </div>

                            <div className="kg-card p-4">
                                <h2 className="h5 mb-3">Items ({cart.totalUnits} units)</h2>
                                <OrderItems products={cart.products} />
                            </div>
                        </>
                    )}

                </div>

                {/* right: the summary; the short product list only on the Delivery step, like the wireframe */}
                <div className="col-lg-4">
                    <CheckoutSummary cart={cart} deliveryFee={deliveryFee} showProducts={step === 1} />
                    {step === 2 && (
                        <div className="mt-3">
                            {placeError && (
                                <div className="alert alert-danger" role="alert">
                                    {placeError} <Link href="/cart">Back to cart</Link>
                                </div>
                            )}
                            <button type="button" className="btn btn-kg-primary btn-lg w-100"
                                onClick={handlePlaceOrder} disabled={placing}>
                                {placing ? 'Placing order…' : 'Place order'}
                            </button>
                            {/* until Stripe is added (20 Nov), orders are saved as "pending payment" */}
                            <p className="kg-card-meta small mt-2 mb-0">
                                Card payment is coming soon. Your order is saved as pending payment.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
