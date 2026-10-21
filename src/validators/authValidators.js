// Validating using Yup on the server side

const yup = require("yup");

const registerSchema = yup.object({
    name: yup.string().trim().required('Name is required').max(100, 'Name is too long'),
    email: yup.string().trim().required('Email is required').email('Enter a valid email address').max(100, 'Email is too long'),
    password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/\d/, 'Password must include a number'),
});

module.exports = { registerSchema };