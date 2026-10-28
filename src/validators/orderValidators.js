// Validating using Yup on the server side for checkout (delivery details) and :id in the URL

const yup = require("yup");

// delivery details for checkout - SG address only
const checkoutSchema = yup.object ({
    recipientName: yup.string().trim().min(2, 'Name is too short').max(100, 'Name is too long').required('Recipient name is required'),
    //SG phone numbers starting 6, 8 or 9
    recipientPhoneNum: yup.string().trim().matches(/^[689]\d{7}$/, 'Enter a valid Singapore phone number (8 digits)').required('Phone number is required'),
    addressLine1: yup.string().trim().max(128, 'Address is too long').required('Address is required'),
    // optional, in React will have '#' as a fixed prefix
    unitNumber: yup.string().trim().matches(/^\d{1,3}-\d{1,5}[A-Za-z]?$/, { message: 'Unit number must look like 12-34', excludeEmptyString: true }),
    addressLine2: yup.string().trim().max(128, 'Address is too long'),
    postalCode: yup.string().trim().matches(/^\d{6}$/, 'Postal code must be 6 digits').required('Postal code is required'),
});
// order detail :id in the URL
const orderIdSchema = yup.object ({
    id: yup.number().integer().positive().required(),
});

module.exports = { checkoutSchema, orderIdSchema };