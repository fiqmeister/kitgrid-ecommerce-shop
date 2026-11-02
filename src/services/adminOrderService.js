// admin orders: works out the orders list page (Part A). Detail and status changes are added in Part B

const adminOrderDal = require('../dal/adminOrderDal');
const orderDal = require('../dal/orderDal'); // reuse findOrderItems: the same item rows as the customer's page
const createError = require('../utils/createError');


const page_size = 8; // rows per page, as in the wireframe

// the words shown on the status badges and in the status dropdown
const statusLabels = {
    pending_payment: 'Pending payment',
    paid: 'Paid',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};
// which statuses an order can move to next. "Paid" is not here: it has its own Mark as paid button
const nextStatuses = {
    pending_payment: ['cancelled'],
    paid: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
};


// orders list: one page of every customer's orders, plus the numbers for "Showing 1 to 8 of 37"
async function listOrders(query) {
    // "1043" or "#1043" in the search box counts as an order number, anything else as a customer name
    let orderNumber = null;
    if (query.search) {
        const withoutHash = query.search.replace('#', '');
        if (/^\d+$/.test(withoutHash)) { // only digits
            orderNumber = Number(withoutHash);
        }
    }

    const filters = {
        search: query.search,
        orderNumber: orderNumber,
        status: query.status,
        from: query.from,
        to: query.to,
    };

    const offset = (query.page - 1) * page_size;
    const rows = await adminOrderDal.findOrders(filters, page_size, offset);
    const total = await adminOrderDal.countOrders(filters);

    // tidy each row for the page: numbers as numbers, readable status
    const orders = rows.map(row => ({
        id: row.id,
        status: row.status,
        statusLabel: statusLabels[row.status],
        createdAt: row.created_at,
        customerName: row.customer_name,
        teamName: row.team_name, // null when the customer has no team
        totalUnits: Number(row.total_units), // SUM comes back as a string
        total: Number(row.total),
    }));

    return {
        orders: orders,
        page: query.page,
        total: total,
        totalPages: Math.ceil(total / page_size),
        firstShown: total === 0 ? 0 : offset + 1, // "Showing 9 to 16 of 37"
        lastShown: offset + orders.length,
    };
}
// one order for the detail page: customer, delivery address, items, totals, history and the allowed next steps
async function getOrder(orderId) {
    const order = await adminOrderDal.findOrderById(orderId);
    if (!order) {
        throw createError('Order not found', 404);
    }
    const itemRows = await orderDal.findOrderItems(orderId);
    const historyRows = await adminOrderDal.findStatusHistory(orderId);

    // item lines, as stored at checkout (price snapshot). lineTotal is before discount, like the cart and customer pages
    let totalUnits = 0;
    const items = itemRows.map(row => {
        totalUnits += row.quantity;
        return {
            productName: row.product_name,
            colour: row.colour,
            size: row.size,
            quantity: row.quantity,
            unitPrice: Number(row.unit_price),
            discountPercent: Number(row.discount_percent),
            lineTotal: Number(row.line_total),
        };
    });

    // who made each change: the user's role, or Stripe when changed_by is empty (the payment step)
    const history = historyRows.map(row => ({
        status: row.status,
        statusLabel: statusLabels[row.status],
        changedAt: row.changed_at,
        changedBy: row.changed_by_role || 'Stripe',
    }));

    return {
        id: order.id,
        status: order.status,
        statusLabel: statusLabels[order.status],
        createdAt: order.created_at,
        customer: {
            name: order.customer_name,
            email: order.customer_email,
            teamName: order.team_name,
        },
        delivery: {
            recipientName: order.recipient_name,
            phone: order.phone,
            addressLine1: order.address_line1,
            unitNumber: order.unit_number,
            addressLine2: order.address_line2,
            postalCode: order.postal_code,
        },
        items: items,
        totalUnits: totalUnits,
        subtotal: Number(order.subtotal),
        discount: Number(order.discount_total),
        deliveryFee: Number(order.delivery_fee),
        total: Number(order.total),
        history: history,
        nextStatuses: nextStatuses[order.status], // for the "Change to" dropdown
        canMarkPaid: order.status === 'pending_payment',
    };
}

// "Update status" form: check the move is allowed from the order's current status, then change it
// cancelling puts the stock back
async function changeStatus(orderId, toStatus, adminId) {
    const order = await adminOrderDal.findOrderById(orderId);
    if (!order) {
        throw createError('Order not found', 404);
    }
    if (!nextStatuses[order.status].includes(toStatus)) {
        throw createError('Cannot change an order from ' + statusLabels[order.status] + ' to ' + statusLabels[toStatus], 400);
    }

    const addStockBack = toStatus === 'cancelled';
    const changed = await adminOrderDal.changeStatus(orderId, order.status, toStatus, adminId, addStockBack);
    if (!changed) { // someone changed it between our check and the update (double click, two tabs)
        throw createError('This order was just changed. Please check its status and try again', 409);
    }
}

// "Mark as paid" button: only for orders waiting for payment (e.g. paid by bank transfer instead of Stripe)
async function markAsPaid(orderId, adminId) {
    const order = await adminOrderDal.findOrderById(orderId);
    if (!order) {
        throw createError('Order not found', 404);
    }
    if (order.status !== 'pending_payment') {
        throw createError('Only orders waiting for payment can be marked as paid', 400);
    }

    const changed = await adminOrderDal.changeStatus(orderId, 'pending_payment', 'paid', adminId, false);
    if (!changed) {
        throw createError('This order was just changed. Please check its status and try again', 409);
    }
}


module.exports = { listOrders, statusLabels, getOrder, changeStatus, markAsPaid };
