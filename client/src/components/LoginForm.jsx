// the "Log in" card: email + password, checked in the browser with Yup, then sent to POST /auth/login
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useLocation } from 'wouter';
import api from '../api';
import { useUser } from '../stores/UserStore';
import './AuthCard.css';

// the same rules as loginSchema on the server (authValidators.js), so the customer sees the message before sending
const validationSchema = Yup.object({
    email: Yup.string().trim().email('Enter a valid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
});

const initialValues = {
    email: '',
    password: '',
};

export default function LoginForm() {
    const [, setLocation] = useLocation();
    const { saveLogin } = useUser();

    const [showPassword, setShowPassword] = useState(false); // the "Show" button: false = dots, true = letters
    const [serverError, setServerError] = useState('');      // the red box: a message from the API, e.g. "Invalid email or password"

    const handleSubmit = async (values, formikHelpers) => {
        setServerError(''); // clear the old message before trying again
        try {
            const response = await api.post('/auth/login', values);
            saveLogin(response.data);  // saves the tokens and the user, and fills the atom
            setLocation('/products');
        } catch (e) {
            // the API sends { error: '...' } for 401 (wrong email or password), 429 (too many tries) and 400
            // no response at all means Express is not running
            if (e.response) {
                setServerError(e.response.data.error);
            } else {
                setServerError('Cannot reach the server. Please try again later.');
            }
            formikHelpers.setSubmitting(false); // turn the button back on so the customer can try again
        }
    };

    return (
        <div className="kg-auth-card">
            <h2>Log in</h2>
            <p className="kg-auth-subtitle">Welcome back. Pick up where your squad left off.</p>

            {serverError && <div className="alert alert-danger" role="alert">{serverError}</div>}

            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                {(formik) => (
                    <Form noValidate>
                        <div className="mb-3">
                            <label htmlFor="login-email" className="form-label">Email</label>
                            <Field type="email" id="login-email" name="email" className="form-control" autoComplete="email" />
                            <ErrorMessage name="email" component="div" className="text-danger small mt-1" />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="login-password" className="form-label">Password</label>
                            <div className="input-group">
                                <Field type={showPassword ? 'text' : 'password'} id="login-password" name="password"
                                    className="form-control" autoComplete="current-password" />
                                <button type="button" className="btn kg-show-button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <ErrorMessage name="password" component="div" className="text-danger small mt-1" />
                        </div>

                        <button type="submit" className="btn btn-kg-primary w-100" disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? 'Logging in...' : 'Log in'}
                        </button>
                    </Form>
                )}
            </Formik>

            <p className="kg-auth-note">No account yet? Create one on the right.</p>
        </div>
    );
}