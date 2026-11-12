// the checkout (/checkout): step 1 Delivery, step 2 Review & place order
// logged-in customers only: the order is made from the cart saved in the database
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useCart } from '../stores/CartStore';
import { useUser } from '../stores/UserStore';
import CheckoutSummary from '../components/CheckoutSummary';
import getDeliveryFee from '../deliveryFee';
import './CheckoutPage.css';
import DeliveryForm from '../components/DeliveryForm';

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

    // early returns: after all the hooks above
    if (!user) {
        return (
            <div className="alert alert-info">
                Please log in to check out. <Link href="/login">Log in or create an account</Link>
            </div>
        );
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
                        <div className="kg-card p-4">
                            <h1 className="h4">Review your order</h1>
                            {/* test only: shows the kept values. Step 3 turns this into the real delivery card */}
                            <p className="mb-1">{delivery.recipientName}, +65 {delivery.recipientPhoneNum}</p>
                            <p className="mb-1">
                                {delivery.unitNumber && '#' + delivery.unitNumber + ', '}{delivery.addressLine1}
                            </p>
                            {delivery.addressLine2 && <p className="mb-1">{delivery.addressLine2}</p>}
                            <p>Singapore {delivery.postalCode}</p>
                            <button type="button" className="btn btn-kg-dark" onClick={() => setStep(1)}>
                                Back to delivery (test)
                            </button>
                        </div>
                    )}
                </div>

                {/* right: the summary; the short product list only on the Delivery step, like the wireframe */}
                <div className="col-lg-4">
                    <CheckoutSummary cart={cart} deliveryFee={deliveryFee} showProducts={step === 1} />
                </div>
            </div>
        </>
    );
}
