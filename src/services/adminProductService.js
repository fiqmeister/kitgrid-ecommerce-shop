// admin products: works out the products list page (Part A). The add / edit form is added in Part B

const adminProductDal = require('../dal/adminProductDal');
const createError = require('../utils/createError');

const page_size = 8; // rows per page, the same as orders and users

// products list: one page of products (active and inactive), plus the numbers for "Showing 1 to 8 of 16"
async function listProducts(query) {
    const filters = {
        search: query.search,
        categoryId: query.category ? Number(query.category) : null, // '3' → 3, '' → no filter
        stock: query.stock,
    };

    const offset = (query.page - 1) * page_size;
    const rows = await adminProductDal.findProducts(filters, page_size, offset);
    const total = await adminProductDal.countProducts(filters);

    const products = rows.map(row => {
        // one alert per product: "Out of stock" is more urgent, so it wins over "Low stock"
        let alert = null;
        if (row.lowest_stock === 0) {
            alert = 'out';
        } else if (row.lowest_margin !== null && row.lowest_margin <= 0) {
            alert = 'low';
        }

        return {
            id: row.id,
            name: row.name,
            categoryName: row.category_name,
            basePrice: Number(row.base_price),
            isBulkEligible: row.is_bulk_eligible === 1,
            isActive: row.is_active === 1,
            totalUnits: Number(row.total_units), // SUM comes back as text; a product with no variants gives null → 0
            alert,
        };
    });

    return {
        products,
        page: query.page,
        total,
        totalPages: Math.ceil(total / page_size),
        firstShown: total === 0 ? 0 : offset + 1,
        lastShown: offset + products.length,
    };
}

// every category, for the Category dropdown
async function listCategories() {
    return adminProductDal.findCategories();
}

// Deactivate / Activate button: hides a product from the shop (or shows it again) without deleting it
async function setActive(productId, isActive) {
    const found = await adminProductDal.setActive(productId, isActive ? 1 : 0);
    if (!found) {
        throw createError('Product not found', 404);
    }
}
// ---------- Part B: the Add / Edit product form ----------

// a database value as text for a form box: null becomes an empty box
function textOrEmpty(value) {
    return value === null ? '' : String(value);
}

// form text back to a database value: an empty box becomes null
function numberOrNull(text) {
    return text === '' || text === undefined ? null : Number(text);
}
function textOrNull(text) {
    return text === '' || text === undefined ? null : text;
}

// categories (dropdown) and tags (checkboxes) for the form
async function getFormOptions() {
    const categories = await adminProductDal.findCategories();
    const tags = await adminProductDal.findTags();
    return { categories: categories, tags: tags };
}

// the values for a brand new, empty form
function emptyForm() {
    return {
        name: '', categoryId: '', basePrice: '', description: '', isBulkEligible: 'on', // bulk discounts on by default
        pitchSurface: '', skillLevel: '', material: '', weightGrams: '', durabilityRating: '',
        tagIds: [],
        variants: [],
    };
}

// one product's values for the Edit form, as TEXT, in the same shape the form sends back
// (so the page can be filled from the database OR from what the admin just typed)
async function getProductForm(productId) {
    const row = await adminProductDal.findProductById(productId);
    if (!row) {
        throw createError('Product not found', 404);
    }
    const variantRows = await adminProductDal.findVariantsForProduct(productId);
    const tagIds = await adminProductDal.findTagIdsForProduct(productId);

    return {
        name: row.name,
        categoryId: String(row.category_id),
        basePrice: Number(row.base_price).toFixed(2), // 38 → "38.00"
        description: textOrEmpty(row.description),
        isBulkEligible: row.is_bulk_eligible === 1 ? 'on' : '',
        pitchSurface: textOrEmpty(row.pitch_surface),
        skillLevel: textOrEmpty(row.skill_level),
        material: textOrEmpty(row.material),
        weightGrams: textOrEmpty(row.weight_grams),
        durabilityRating: textOrEmpty(row.durability_rating),
        tagIds: tagIds.map(tagId => String(tagId)),
        variants: variantRows.map(variant => ({
            id: String(variant.id),
            size: variant.size,
            colour: variant.colour,
            sku: variant.sku,
            ageGroup: textOrEmpty(variant.age_group),
            stock: String(variant.stock),
            lowStockThreshold: String(variant.low_stock_threshold),
        })),
    };
}

// saves the form (already checked by Yup). productId null = Add, a number = Edit
// returns the product's id. Throws 400 with fieldErrors when a SKU is taken, 404 when not found
async function saveProduct(productId, form) {
    const variants = form.variants;

    // SKUs are saved in capitals, so "kg-mj-nvy-s" and "KG-MJ-NVY-S" count as the same
    for (const variant of variants) {
        variant.sku = variant.sku.toUpperCase();
    }

    // 1. the same SKU typed twice in this form
    const fieldErrors = {};
    for (let i = 0; i < variants.length; i++) {
        for (let j = 0; j < i; j++) {
            if (variants[i].sku === variants[j].sku) {
                fieldErrors['variants[' + i + '].sku'] = 'SKU is used twice in this form.';
            }
        }
    }

    // 2. a SKU that another variant in the database already uses
    // (a variant keeping its OWN sku is fine: same id)
    const skus = variants.map(variant => variant.sku);
    const taken = await adminProductDal.findVariantsBySkus(skus);
    for (let i = 0; i < variants.length; i++) {
        const clash = taken.find(row =>
            row.sku.toUpperCase() === variants[i].sku && String(row.id) !== variants[i].id
        );
        if (clash) {
            fieldErrors['variants[' + i + '].sku'] = 'SKU already exists.';
        }
    }

    if (Object.keys(fieldErrors).length > 0) {
        const err = createError('Please fix the highlighted fields.', 400);
        err.fieldErrors = fieldErrors;
        throw err;
    }

    // 3. form text → database values
    const product = {
        name: form.name,
        description: textOrNull(form.description),
        basePrice: Number(form.basePrice),
        isBulkEligible: form.isBulkEligible === 'on' ? 1 : 0,
        pitchSurface: textOrNull(form.pitchSurface),
        material: textOrNull(form.material),
        weightGrams: numberOrNull(form.weightGrams),
        skillLevel: textOrNull(form.skillLevel),
        durabilityRating: numberOrNull(form.durabilityRating),
        categoryId: Number(form.categoryId),
    };
    const variantData = variants.map(variant => ({
        id: numberOrNull(variant.id), // null = new row
        size: variant.size,
        colour: variant.colour,
        sku: variant.sku,
        ageGroup: textOrNull(variant.ageGroup),
        stock: Number(variant.stock),
        lowStockThreshold: Number(variant.lowStockThreshold),
    }));
    const tagIds = (form.tagIds || []).map(tagId => Number(tagId)); // nothing ticked = no tags

    // 4. save everything in one transaction
    let savedId;
    try {
        savedId = await adminProductDal.saveProduct(productId, product, variantData, tagIds);
    } catch (err) {
        // someone saved the same SKU in the split second between our check and the save
        if (err.code === 'ER_DUP_ENTRY') {
            throw createError('A SKU was just taken by another product. Please check and save again.', 409);
        }
        throw err;
    }
    if (savedId === null) {
        throw createError('Product not found', 404);
    }
    return savedId;
}


module.exports = { listProducts, listCategories, setActive, getFormOptions, emptyForm, getProductForm, saveProduct };
