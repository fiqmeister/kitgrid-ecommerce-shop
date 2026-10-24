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

module.exports = { listProducts };