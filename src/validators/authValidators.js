// Validating using Yup on the server side
// a checklist/rules to be used

const yup = require("yup");

// when registering, these are the validators
const registerSchema = yup.object({
    name: yup.string().trim().required('Name is required').max(100, 'Name is too long'),
    email: yup.string().trim().required('Email is required').email('Enter a valid email address').max(100, 'Email is too long'),
    password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/\d/, 'Password must include a number'),
});

// when logging in, these are the validators
const loginSchema = yup.object({
    email: yup.string().trim().required('Email is required').email('Enter a valid email address'),
    password: yup.string().required('Password is required'),
});
// when requesting for access token
const refreshSchema = yup.object ({
    refreshToken: yup.string().required('Refresh token is required'),
});

module.exports = { registerSchema, loginSchema, refreshSchema };