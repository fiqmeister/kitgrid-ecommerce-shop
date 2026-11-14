// the order's progress: Order placed → Paid → Processing → Shipped → Delivered
// built from the order's real status history (order_status_history), so each finished step shows when it happened
// a cancelled order shows only the steps it reached, then a red "Cancelled" step
// the kg-timeline styles are in index.css (shared with the confirmation page)

// the normal journey of an order, in order
const steps = [
    { status: 'pending_payment', label: 'Order placed' },
    { status: 'paid', label: 'Paid' },
    { status: 'processing', label: 'Processing' },
    { status: 'shipped', label: 'Shipped' },
    { status: 'delivered', label: 'Delivered' },
];

// "2026-09-30T00:38:00.000Z" → "30 Sept, 8:38 am" (Singapore time)
function formatDate(text) {
    return new Date(text).toLocaleString('en-SG', {
        day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
    });
}

// status: the order's status now; history: [{ status, changedAt }] from GET /api/orders/:id
export default function OrderTimeline({ status, history }) {
    // every normal step, with the time it happened (null = not reached yet)
    let rows = steps.map(step => {
        const entry = history.find(item => item.status === step.status);
        return {
            status: step.status,
            label: step.label,
            changedAt: entry ? entry.changedAt : null,
        };
    });

    if (status === 'cancelled') {
        // keep only the steps the order really reached, then add "Cancelled" at the end
        rows = rows.filter(row => row.changedAt);
        const cancelEntry = history.find(item => item.status === 'cancelled');
        rows.push({
            status: 'cancelled',
            label: 'Cancelled',
            changedAt: cancelEntry ? cancelEntry.changedAt : null,
        });
    }

    return (
        <ol className="kg-timeline">
            {rows.map(row => {
                // the circle: red for cancelled, green for done, an empty grey ring for not yet
                let className = '';
                if (row.status === 'cancelled') {
                    className = 'kg-timeline-cancelled';
                } else if (row.changedAt) {
                    className = 'kg-timeline-done';
                }
                return (
                    <li key={row.status} className={className}>
                        <strong>{row.label}</strong>
                        <div className="kg-card-meta">{row.changedAt ? formatDate(row.changedAt) : 'Not yet'}</div>
                    </li>
                );
            })}
        </ol>
    );
}
