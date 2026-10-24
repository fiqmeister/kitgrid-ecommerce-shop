// Validating using Yup on the server side for products
// a checklist/rules to be used

const yup = require("yup");

const productListSchema = yup.object ({
    search: yup.string().trim().max(100),
    categoryId: yup.number().integer().positive(),
    minPrice: yup.number().min(0),
    maxPrice: yup.number().min(0),
    pitchSurface: yup.string().oneOf(['FG','AG','indoor','all']),
    skillLevel: yup.string().oneOf(['youth', 'amateur', 'pro']),
    ageGroup: yup.string().oneOf(['mini_junior', 'youth', 'senior']),
    colours: yup.string().max(200),
    tag: yup.string().trim().max(50),
    sort: yup.string().oneOf(['newest', 'price_asc', 'price_desc']).default('newest'),
    page: yup.number().integer().min(1).default(1),
    limit: yup.number().integer().min(1).max(50).default(12)
});
// check the :id is a positive whole number
const productIdSchema = yup.object ({
    id: yup.number().integer().positive().required()
});

module.exports = { productListSchema, productIdSchema };