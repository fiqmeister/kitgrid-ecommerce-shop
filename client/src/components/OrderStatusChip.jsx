// the small rounded label with an order's status, e.g. "Pending payment"
// used by the confirmation page, My orders and the order detail page, so the words are written once
import './OrderStatusChip.css';

// the database status → the words the customer sees
const statusLabels = {
    pending_payment: 'Pending payment',
    paid: 'Paid',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

// status: the database value from the API, e.g. 'pending_payment'
export default function OrderStatusChip({ status }) {
    return <span className="kg-status-chip">{statusLabels[status]}</span>;
}
