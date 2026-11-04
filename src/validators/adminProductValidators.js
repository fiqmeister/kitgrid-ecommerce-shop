// checks the filters on the admin products list

const yup = require('yup');

// products list query string: search, category, stock alert, page (8 per page)
const adminProductListSchema = yup.object({
    search: yup.string().trim().max(100, 'Search is too long'), // part of a product name
    // a category id like "3", or '' for "All categories"
    category: yup.string().trim().matches(/^\d+$/, { message: 'Unknown category', excludeEmptyString: true }),
    // '' = All, 'low' = at least one variant at or below its threshold, 'out' = at least one variant at 0
    stock: yup.string().oneOf(['', 'low', 'out'], 'Unknown stock filter'),
    page: yup.number().integer().min(1).default(1),
});
// the Add / Edit product form
// numbers are checked as TEXT with a pattern (like the category filter):
// an empty box sends '' and yup.number() cannot handle '', so the service turns them into numbers
const wholeNumber = /^\d+$/;              // 0, 12, 150
const price = /^\d+(\.\d{1,2})?$/;        // 38, 38.5, 38.00

// one row of the Variants table
const variantRowSchema = yup.object({
    id: yup.string().matches(wholeNumber, { message: 'Unknown variant', excludeEmptyString: true }), // hidden; '' for a new row
    size: yup.string().trim().required('Size is required').max(20, 'Size is too long'),
    colour: yup.string().trim().required('Colour is required').max(30, 'Colour is too long'),
    sku: yup.string().trim().required('SKU is required').max(50, 'SKU is too long'),
    ageGroup: yup.string().oneOf(['mini_junior', 'youth', 'senior', ''], 'Unknown age group'),
    stock: yup.string().trim().required('Stock is required').matches(wholeNumber, 'Stock must be a whole number'),
    lowStockThreshold: yup.string().trim().required('Threshold is required').matches(wholeNumber, 'Threshold must be a whole number'),
});

const productFormSchema = yup.object({
    // Basic details
    name: yup.string().trim().required('Name is required').max(100, 'Name is too long'),
    categoryId: yup.string().required('Choose a category').matches(wholeNumber, 'Choose a category'),
    basePrice: yup.string().trim().required('Price is required').matches(price, 'Price must be a number like 38.00'),
    description: yup.string().trim().max(2000, 'Description is too long'),
    isBulkEligible: yup.string(), // a ticked checkbox sends 'on'; an unticked one sends nothing at all

    // Specifications ('' = Not set)
    pitchSurface: yup.string().oneOf(['FG', 'AG', 'indoor', 'all', ''], 'Unknown pitch surface'),
    skillLevel: yup.string().oneOf(['youth', 'amateur', 'pro', ''], 'Unknown skill level'),
    material: yup.string().trim().max(100, 'Material is too long'),
    weightGrams: yup.string().trim().matches(wholeNumber, { message: 'Weight must be a whole number of grams', excludeEmptyString: true }),
    durabilityRating: yup.string().trim().matches(/^[1-5]$/, { message: 'Durability must be 1 to 5', excludeEmptyString: true }),

    // Tags: the ids of the ticked boxes (nothing ticked = the field is missing)
    tagIds: yup.array().of(yup.string().matches(wholeNumber, 'Unknown tag')),

    // Variants: the empty rows are removed by the controller BEFORE this check
    variants: yup.array().of(variantRowSchema).min(1, 'Add at least one variant'),
});
// threshold change from the admin assistant's Confirm button (form field: threshold)
// the AI only proposed the number, so the server checks it again here
const thresholdSchema = yup.object({
    threshold: yup.number()
        .typeError('Threshold must be a number')
        .integer('Threshold must be a whole number')
        .min(0, 'Threshold cannot be negative')
        .max(1000, 'Threshold cannot be above 1000')
        .required('Threshold is required'),
});


module.exports = { adminProductListSchema, productFormSchema, thresholdSchema };