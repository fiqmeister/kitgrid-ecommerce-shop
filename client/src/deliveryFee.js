// the delivery fee rule, copied from the server (getDeliveryFee in src/services/orderService.js)
// the client must not import from the backend, so it has its own copy
// it is only used to SHOW the fee before the order exists: the server works it out again when the order is created
const deliveryFeePrice = 8;        // flat fee, S$8.00
export const freeDeliveryUnits = 15; // free from 15 units (the summary also uses this for "Add 6 more items...")

function getDeliveryFee(totalUnits) {
    if (totalUnits >= freeDeliveryUnits) {
        return 0;
    }
    return deliveryFeePrice;
}

export default getDeliveryFee;
