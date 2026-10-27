// Validating using Yup on the server side for cart on each req body and :variantId in the URL
// a checklist/rules to be used

const yup = require("yup");

// adding to the cart: which variant and how many
const addItemSchema = yup.object ({
    variantId: yup.number().integer().positive().required('Variant is required'),
    quantity: yup.number().integer().min(1, 'Quantity must be at least 1').max(1000, 'Quantity is too large').required('Quantity is required'),
});

// changing quantity: input 0 will remove the item
const updateItemSchema = yup.object ({
    quantity: yup.number().integer().min(0, 'Quantity cannot be negative').max(1000, 'Quantity is too large').required('Quantity is required'),
});

// the :variantId in the URL
const variantIdSchema = yup.object ({
    variantId: yup.number().integer().positive().required(),
});

//the guest cart sent after login: list of cart items, each checked by the same rules as adding
const mergeCartSchema = yup.object ({
    items: yup.array().of(addItemSchema).min(1, 'Need at least one item').max(50, 'Too many items').required('Items are required'),
});

module.exports = { addItemSchema, updateItemSchema, variantIdSchema, mergeCartSchema };