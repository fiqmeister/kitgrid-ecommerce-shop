// business logic for the N8N tools: turns the raw rows into clear facts for the AI
// the AI should never do the maths itself, so every number is worked out here

const toolDal = require('../dal/toolDal');

const sales_days = 30; // how far back "recently sold" looks

// T1, 3 things: low-stock variants, how many sold recently, and a suggested reorder amount
async function getLowStock() {
    const variants = await toolDal.findLowStock();

    // the date 30 days ago from today
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - sales_days);

    // all sold item lines for these variants, in one query
    const variantIds = variants.map(variant => variant.id);
    const soldRows = await toolDal.findSoldItems(variantIds, sinceDate);

    const items = [];
    for (const variant of variants) {
        // add up this variant's sold quantities
        let soldLast30Days = 0;
        for (const row of soldRows) {
            if (row.variant_id === variant.id) {
                soldLast30Days += row.quantity;
            }
        }

        // enough to cover another 30 days of sales and end back above the warning level
        let suggestedReorder = soldLast30Days + variant.low_stock_threshold - variant.stock;
        if (suggestedReorder < 0) {
            suggestedReorder = 0;
        }

        items.push({
            variantId: variant.id,
            productName: variant.product_name,
            sku: variant.sku,
            colour: variant.colour,
            size: variant.size,
            stock: variant.stock,
            threshold: variant.low_stock_threshold,
            outOfStock: variant.stock === 0,
            soldLast30Days,
            suggestedReorder,
        });
    }

    return {
        count: items.length,
        items: items,
    };
}

module.exports = { getLowStock };