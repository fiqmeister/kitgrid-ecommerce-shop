const productDal = require('../dal/productDal');
const createError = require('../utils/createError');

async function listProducts(query) {
    if (query.minPrice !== undefined && query.maxPrice !== undefined && query.minPrice > query.maxPrice) {
        throw createError('Minimum price cannot be higher than maximum price', 400);
    }

    const filters = {
        search: query.search,
        categoryId: query.categoryId,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        pitchSurface: query.pitchSurface,
        skillLevel: query.skillLevel,
        ageGroup: query.ageGroup,
        colours: query.colours ? query.colours.split(',') : [],
        tag: query.tag,
    };

    const offset = (query.page - 1) * query.limit; // limit default is 12, set at productValidators
    const items = await productDal.findAll(filters, query.sort, query.limit, offset);
    const total = await productDal.count(filters);

    return {
        items: items,
        page: query.page,
        limit: query.limit,
        total: total,
        totalPages: Math.ceil(total / query.limit),
    };
}
// calls the 4 DAL functions for the product detail page
async function getProduct(id) {
    const product = await productDal.findById(id);
    //run the error path first
    if (!product) {
        throw createError('Product not found', 404);
    }
    //get the variants, tags, bulk tiers rows raw data by looping
    const variantRows = await productDal.findVariants(id);
    const tagRows = await productDal.findTags(id);
    const bulkRows = await productDal.findBulkDiscount();

    const basePrice = Number(product.base_price);// db sends as string, need to convert

    //loop variantRows

    const variants = [];
    const colours = [];
    const ageGroups = [];
    let totalStock = 0;

    for (const row of variantRows) {
        variants.push ({
            id: row.id,
            sku: row.sku,
            size: row.size,
            colour: row.colour,
            ageGroup: row.age_group,
            stock: row.stock,
        });
        totalStock += row.stock;
        // check if this colour not in the list, if yes, push(add)
        if (!colours.includes(row.colour)) {
            colours.push(row.colour);
        }
        // check if row.age_group has value AND if this age_group not in the list
        // if both true, push(add); cannot have value to be Null
        if (row.age_group && !ageGroups.includes(row.age_group)) {
            ageGroups.push(row.age_group);
        }
    }

    const tags = [];
    for (const row of tagRows) {
        tags.push(row.name);
    }

    // start with "Standard" price first, then go up the tiers 
    const bulkTiers = [];
    if (product.is_bulk_eligible === 1) {
        bulkTiers.push({
            minQuantity: 1,
            discountPercent: 0,
            unitPrice: basePrice
        });
        for (const row of bulkRows) {
            const percent = Number(row.discount_percent);
            const unitPrice = Math.round(basePrice * (100 - percent)) / 100; // rounds to 2 decimals
            bulkTiers.push({
                minQuantity: row.min_quantity,
                discountPercent: percent,
                unitPrice
            });
        }
    }

    return {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        basePrice,
        pitchSurface: product.pitch_surface,
        skillLevel: product.skill_level,
        material: product.material,
        weightGrams: product.weight_grams,
        durabilityRating: product.durability_rating,
        isBulkEligible: product.is_bulk_eligible === 1,
        totalStock,
        colours,
        ageGroups,
        tags,
        bulkTiers,
        variants,
    };

}

module.exports = { listProducts, getProduct };