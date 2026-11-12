// step 1 of the checkout: who receives the order and where (Singapore addresses only)
// checked in the browser with the same rules as checkoutSchema on the server (src/validators/orderValidators.js)
// Continue does NOT send anything: the values go back to CheckoutPage and are sent with the order in the next step
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './DeliveryForm.css';

// the same rules and messages as checkoutSchema on the server
const validationSchema = Yup.object({
    recipientName: Yup.string().trim().min(2, 'Name is too short').max(100, 'Name is too long')
        .required('Recipient name is required'),
    // Singapore numbers: 8 digits, starting with 6, 8 or 9
    recipientPhoneNum: Yup.string().trim().matches(/^[689]\d{7}$/, 'Enter a valid Singapore phone number (8 digits)')
        .required('Phone number is required'),
    postalCode: Yup.string().trim().matches(/^\d{6}$/, 'Postal code must be 6 digits')
        .required('Postal code is required'),
    // optional: an empty box is fine (excludeEmptyString), otherwise it must look like 12-34
    unitNumber: Yup.string().trim()
        .matches(/^\d{1,3}-\d{1,5}[A-Za-z]?$/, { message: 'Unit number must look like 12-34', excludeEmptyString: true }),
    addressLine1: Yup.string().trim().max(128, 'Address is too long').required('Address is required'),
    addressLine2: Yup.string().trim().max(128, 'Address is too long'),
});

// initialValues: the delivery details kept by CheckoutPage (only the name the first time, everything typed after Edit)
// email: the account's email, shown only (it is not part of the order)
// deliveryFee: 8 or 0, for the Delivery method box
// onContinue: CheckoutPage's function that keeps the values and moves to step 2
export default function DeliveryForm({ initialValues, email, deliveryFee, onContinue }) {
    return (
        <div className="kg-card p-4">
            <h1 className="h4 mb-4">Delivery</h1>

            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onContinue}>
                <Form noValidate>
                    {/* ---------- Contact ---------- */}
                    <h2 className="kg-form-section">Contact</h2>

                    <div className="mb-3">
                        <label htmlFor="recipientName" className="form-label">Full name</label>
                        <Field id="recipientName" name="recipientName" className="form-control" autoComplete="name" />
                        <ErrorMessage name="recipientName" component="div" className="text-danger small mt-1" />
                    </div>

                    <div className="row g-3 mb-4">
                        <div className="col-sm-6">
                            <label htmlFor="recipientPhoneNum" className="form-label">Mobile</label>
                            {/* "+65" is fixed text in front of the box: the customer types only the 8 digits */}
                            <div className="input-group">
                                <span className="input-group-text">+65</span>
                                <Field type="tel" id="recipientPhoneNum" name="recipientPhoneNum"
                                    className="form-control" autoComplete="tel-national" />
                            </div>
                            <div className="form-text">8 digits, no spaces.</div>
                            <ErrorMessage name="recipientPhoneNum" component="div" className="text-danger small mt-1" />
                        </div>

                        <div className="col-sm-6">
                            <label htmlFor="checkout-email" className="form-label">Email</label>
                            {/* a plain input, not a Field: it is not part of the form, only shown */}
                            <input type="email" id="checkout-email" className="form-control kg-readonly"
                                value={email} readOnly />
                            <div className="form-text">From your account.</div>
                        </div>
                    </div>

                    {/* ---------- Address ---------- */}
                    <h2 className="kg-form-section">Delivery address (Singapore)</h2>

                    <div className="row g-3 mb-3">
                        <div className="col-sm-6">
                            <label htmlFor="postalCode" className="form-label">Postal code</label>
                            <Field id="postalCode" name="postalCode" className="form-control"
                                autoComplete="postal-code" inputMode="numeric" />
                            <ErrorMessage name="postalCode" component="div" className="text-danger small mt-1" />
                        </div>

                        <div className="col-sm-6">
                            <label htmlFor="unitNumber" className="form-label">Unit number (optional)</label>
                            {/* "#" is fixed text: the customer types 12-34, the server saves 12-34 */}
                            <div className="input-group">
                                <span className="input-group-text">#</span>
                                <Field id="unitNumber" name="unitNumber" className="form-control" placeholder="12-34" />
                            </div>
                            <ErrorMessage name="unitNumber" component="div" className="text-danger small mt-1" />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="addressLine1" className="form-label">Block and street name</label>
                        <Field id="addressLine1" name="addressLine1" className="form-control"
                            autoComplete="address-line1" placeholder="e.g. 123 Tampines Street 11" />
                        <ErrorMessage name="addressLine1" component="div" className="text-danger small mt-1" />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="addressLine2" className="form-label">Building name (optional)</label>
                        <Field id="addressLine2" name="addressLine2" className="form-control"
                            autoComplete="address-line2" />
                        <ErrorMessage name="addressLine2" component="div" className="text-danger small mt-1" />
                    </div>

                    {/* ---------- Delivery method: only one, so a box instead of a radio button ---------- */}
                    <h2 className="kg-form-section">Delivery method</h2>
                    <div className="kg-delivery-method mb-4">
                        <div className="d-flex justify-content-between">
                            <strong>Standard delivery</strong>
                            <strong className={deliveryFee === 0 ? 'kg-checkout-free' : ''}>
                                {deliveryFee === 0 ? 'FREE' : 'S$' + deliveryFee.toFixed(2)}
                            </strong>
                        </div>
                        <div className="kg-card-meta">Flat S$8.00, free on orders of 15+ items.</div>
                    </div>

                    <button type="submit" className="btn btn-kg-primary w-100">Continue to review</button>
                </Form>
            </Formik>
        </div>
    );
}
