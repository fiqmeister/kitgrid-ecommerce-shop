// business logic for the N8N tools: turns the raw rows into clear facts for the AI
// the AI should never do the maths itself, so every number is worked out here

const toolDal = require('../dal/toolDal');
const createError = require('../utils/createError');
const roundMoney = require('../utils/roundMoney');


const sales_days = 30; // how far back "recently sold" 
const summary_days = 7;   // default summary: the last 7 days, today included
const unpaid_hours = 24;  // unpaid longer than this needs attention (it is holding stock)
const list_limit = 10;    // the most orders to list per group
const variant_limit = 20; // the most variants a lookup returns


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
// turns a JS date into text like 2026-10-29, using the computer's own (Singapore) time
function toDateText(date) {
    const year = date.getFullYear();
    let month = date.getMonth() + 1; // getMonth() counts from 0 (January = 0)
    let day = date.getDate();
    if (month < 10) {
        month = '0' + month; // 9 becomes "09"
    }
    if (day < 10) {
        day = '0' + day;
    }
    return year + '-' + month + '-' + day;
}
// T2: order counts and paid revenue for a date range, plus the orders that need the admin attn
async function getOrderSummary(query) {
    // 1. the date range: use the dates sent, or default to the last 7 days
    let toDate = query.to;
    if (!toDate) {
        toDate = toDateText(new Date()); // today
    }
    let fromDate = query.from;
    if (!fromDate) {
        const startDay = new Date();
        startDay.setDate(startDay.getDate() - (summary_days - 1)); // 6 days ago + today = 7 days
        fromDate = toDateText(startDay);
    }
    if (fromDate > toDate) {
        throw createError('from must be on or before to', 400);
    }

    // 2. the numbers for the dashboard boxes, from one row per status
    const statusRows = await toolDal.countOrdersByStatus(fromDate, toDate);
    let totalOrders = 0;
    let cancelledOrders = 0;
    let paidRevenue = 0;
    for (const row of statusRows) {
        totalOrders += row.order_count;
        if (row.status === 'cancelled') {
            cancelledOrders = row.order_count;
        } else if (row.status !== 'pending_payment') {
            paidRevenue += Number(row.total_amount); // paid, processing, shipped, delivered
        }
    }

    // 3. orders that need action now: split into "waiting to ship" and "unpaid for too long"
    const unpaidCutoff = new Date();
    unpaidCutoff.setHours(unpaidCutoff.getHours() - unpaid_hours); // 24 hours ago

    const attentionRows = await toolDal.findOrdersNeedAttn();
    const waitingToShip = { count: 0, orders: [] };
    const unpaidOverLimit = { count: 0, orders: [] };

    for (const order of attentionRows) {
        const card = {
            id: order.id,
            status: order.status,
            total: Number(order.total),
            createdAt: order.created_at,
        };
        if (order.status === 'paid' || order.status === 'processing') {
            waitingToShip.count += 1;
            if (waitingToShip.orders.length < list_limit) {
                waitingToShip.orders.push(card);
            }
        } else if (order.created_at < unpaidCutoff) { // pending_payment, placed over 24 hours ago
            unpaidOverLimit.count += 1;
            if (unpaidOverLimit.orders.length < list_limit) {
                unpaidOverLimit.orders.push(card);
            }
        }
    }

    return {
        from: fromDate,
        to: toDate,
        totalOrders: totalOrders,
        cancelledOrders: cancelledOrders,
        paidRevenue: roundMoney(paidRevenue),
        waitingToShip: waitingToShip,
        unpaidOver24h: unpaidOverLimit,
    };
}
// T6: what to pick off the shelves, and where each order goes, grouped by postal sector
async function getOrdersToShip() {
    const pickRows = await toolDal.findPickList();
    const orderRows = await toolDal.findOrdersToShip();

    // 1. pick list: one line per item, quantities already added up by the DAL
    const pickList = [];
    let totalUnits = 0;
    for (const row of pickRows) {
        const quantity = Number(row.total_quantity); // SUM comes back as text
        totalUnits += quantity;
        pickList.push({
            variantId: row.variant_id,
            sku: row.sku,
            productName: row.product_name,
            colour: row.colour,
            size: row.size,
            quantity: quantity,
        });
    }

    // 2. delivery list: orders grouped by postal sector (first 2 digits of the postal code)
    const sectors = [];
    for (const order of orderRows) {
        const sectorCode = order.postal_code.substring(0, 2); // "520123" becomes "52"

        // this sector already in the list? use it, otherwise start a new group
        let sector = sectors.find(group => group.sector === sectorCode);
        if (!sector) {
            sector = { sector: sectorCode, orders: [] };
            sectors.push(sector);
        }

        sector.orders.push({
            id: order.id,
            status: order.status,
            createdAt: order.created_at,
            recipientName: order.recipient_name,
            phone: order.phone,
            addressLine1: order.address_line1,
            unitNumber: order.unit_number,
            addressLine2: order.address_line2,
            postalCode: order.postal_code,
        });
    }

    return {
        orderCount: orderRows.length,
        totalUnits: totalUnits,
        pickList: pickList,
        deliveries: sectors,
    };
}
// T3: find variants and their current low-stock threshold, so the AI can propose a change
// nothing is saved here: the admin confirms the change on the dashboard
async function searchVariants(query) {
    if (!query.search && !query.colour && !query.size) {
        throw createError('Give at least one of: search, colour, size', 400);
    }

    const filters = {
        search: query.search,
        colour: query.colour,
        size: query.size,
    };
    const rows = await toolDal.findVariants(filters, variant_limit);

    const items = rows.map(row => ({
        variantId: row.id,
        productName: row.product_name,
        sku: row.sku,
        colour: row.colour,
        size: row.size,
        stock: row.stock,
        threshold: row.low_stock_threshold,
    }));

    return {
        count: items.length,
        limitReached: items.length === variant_limit,
        items: items,
    };
}


module.exports = { getLowStock, getOrderSummary, getOrdersToShip, searchVariants };