// the "Create an account" card: name, email, password → POST /auth/register, then logs in straight away with POST /auth/login
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useLocation } from 'wouter';
import api from '../api';
import { useUser } from '../stores/UserStore';
import './AuthCard.css';
import { useCart } from '../stores/CartStore';

// the same rules as registerSchema on the server (authValidators.js)
const validationSchema = Yup.object({
    name: Yup.string().trim().required('Name is required').max(100, 'Name is too long'),
    email: Yup.string().trim().required('Email is required').email('Enter a valid email address').max(100, 'Email is too long'),
    password: Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/\d/, 'Password must include a number'), // \d = any digit 0-9
});

const initialValues = {
    name: '',
    email: '',
    password: '',
};

export default function RegisterForm() {
    const [, setLocation] = useLocation();
    const { saveLogin } = useUser();
    const { mergeGuestCart } = useCart();

    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState('');

    const handleSubmit = async (values, formikHelpers) => {
        setServerError('');
        try {
            // 1. create the account (the API answers 201 with the user, but no tokens)
            await api.post('/auth/register', values);

            // 2. log in with the same email and password, to get the tokens
            const response = await api.post('/auth/login', { email: values.email, password: values.password });
            // move the guest cart into the account BEFORE saveLogin: saveLogin changes `user`, which makes the
            // Header reload the cart, so the merged items must already be in the database by then
            let hadGuestItems = false;
            try {
                hadGuestItems = await mergeGuestCart(response.data.accessToken);
            } catch (mergeError) {
                // the login still works; the guest cart stays in this browser, so nothing is lost
                console.error(mergeError);
            }

            saveLogin(response.data);  // saves the tokens and the user, and fills the atom
            // came with a cart → back to it ("Your cart is kept"), otherwise to the products
            setLocation(hadGuestItems ? '/cart' : '/products');

        } catch (e) {
            // e.g. 409 "Email is already registered"
            if (e.response) {
                setServerError(e.response.data.error);
            } else {
                setServerError('Cannot reach the server. Please try again later.');
            }
            formikHelpers.setSubmitting(false);
        }
    };

    return (
        <div className="kg-auth-card">
            <h2>Create an account</h2>
            <p className="kg-auth-subtitle">For coaches, managers and individual players.</p>

            {serverError && <div className="alert alert-danger" role="alert">{serverError}</div>}

            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                {(formik) => (
                    <Form noValidate>
                        <div className="mb-3">
                            <label htmlFor="register-name" className="form-label">Full name</label>
                            <Field type="text" id="register-name" name="name" className="form-control" autoComplete="name" />
                            <ErrorMessage name="name" component="div" className="text-danger small mt-1" />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="register-email" className="form-label">Email</label>
                            <Field type="email" id="register-email" name="email" className="form-control" autoComplete="email" />
                            <ErrorMessage name="email" component="div" className="text-danger small mt-1" />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="register-password" className="form-label">Password</label>
                            <div className="input-group">
                                <Field type={showPassword ? 'text' : 'password'} id="register-password" name="password"
                                    className="form-control" autoComplete="new-password" aria-describedby="register-password-hint" />
                                <button type="button" className="btn kg-show-button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <div id="register-password-hint" className="form-text">At least 8 characters, with a number.</div>
                            <ErrorMessage name="password" component="div" className="text-danger small mt-1" />
                        </div>

                        <button type="submit" className="btn btn-kg-dark w-100" disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? 'Creating account...' : 'Create account'}
                        </button>
                    </Form>
                )}
            </Formik>

            <p className="kg-auth-note">Buying for a team? Add a team profile later. It's optional.</p>
        </div>
    );
}
