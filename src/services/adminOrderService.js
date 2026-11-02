// admin orders: works out the orders list page (Part A). Detail and status changes are added in Part B

const adminOrderDal = require('../dal/adminOrderDal');

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

module.exports = { listOrders, statusLabels };
