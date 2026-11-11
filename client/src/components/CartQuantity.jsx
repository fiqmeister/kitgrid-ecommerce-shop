// the quantity box for one size in the cart (like the trainer's CartQuantity)
// it keeps its own text while the customer types, and only saves when they leave the box or press Enter,
// so typing "12" doesn't send a request for "1" and then another for "12"
import { useState, useEffect } from 'react';

// quantity: the saved quantity from the cart, stock: the most allowed,
// label: for screen readers, e.g. "Matchday Jersey Navy S"
// onUpdateValue(newQuantity): saves it, and answers true (saved) or false (failed)
export default function CartQuantity({ quantity, stock, label, disabled, onUpdateValue }) {
    const [text, setText] = useState(quantity); // what is in the box right now

    // when the saved quantity changes (the server answered), show it in the box
    useEffect(() => {
        setText(quantity);
    }, [quantity]);

    async function saveQuantity() {
        // empty box (cleared to type a new number, then left): put the saved number back, don't remove by accident
        if (text === '') {
            setText(quantity);
            return;
        }

        // the same rules as the product page: a whole number from 0 to the stock
        let newQuantity = Math.floor(Number(text));
        if (newQuantity < 0) {
            newQuantity = 0;
        }
        if (newQuantity > stock) {
            newQuantity = stock;
        }
        setText(newQuantity); // show the fixed number, e.g. 99 → 12

        if (newQuantity === quantity) {
            return; // nothing changed, so no request
        }

        const saved = await onUpdateValue(newQuantity);
        if (!saved) {
            setText(quantity); // it failed: show the saved number again
        }
    }

    // Enter = leave the box; that runs saveQuantity through onBlur, so it only saves once
    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    }

    return (
        <input
            type="number"
            className="form-control form-control-sm kg-qty-input"
            min="0"
            max={stock}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={saveQuantity}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-label={'Quantity for ' + label}
        />
    );
}
