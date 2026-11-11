// the shopping cart, shared by every component (Jotai), plus the functions that change it
// guest: the items are kept in localStorage and priced by POST /api/cart/quote
// logged in: the cart is kept in the database (cart_items) and priced by GET /api/cart
// either way, cartAtom holds the priced cart in the same shape, so pages don't need to know which
import { atom, useAtom } from 'jotai';
import api from '../api';
import { useUser } from './UserStore';

// read the saved guest cart when the app starts (nothing saved → null → use an empty list)
const getGuestCartFromStorage = () => {
    return JSON.parse(localStorage.getItem('guestCart')) || [];
};

// the guest cart: [{ variantId, quantity }], e.g. [{ variantId: 1, quantity: 4 }, { variantId: 3, quantity: 5 }]
// only ids and quantities: names and prices always come fresh from the server
const guestCartAtom = atom(getGuestCartFromStorage());

// the priced cart: the same shape as GET /api/cart: { products: [...], totalUnits, subtotal, discount, total }
const emptyCart = { products: [], totalUnits: 0, subtotal: 0, discount: 0, total: 0 };
const cartAtom = atom(emptyCart);

// the hook: components use this instead of calling the cart API themselves
// the functions don't catch errors: the page that calls them shows the message to the customer
export const useCart = () => {
    const [cart, setCart] = useAtom(cartAtom);
    const [guestCart, setGuestCart] = useAtom(guestCartAtom);
    const { user } = useUser();

    // save the guest cart in the atom AND in localStorage, so it survives F5
    const saveGuestCart = (items) => {
        localStorage.setItem('guestCart', JSON.stringify(items));
        setGuestCart(items);
    };

    // ask the server to price a guest cart (an empty cart needs no request)
    const priceGuestCart = async (items) => {
        if (items.length === 0) {
            setCart(emptyCart);
            return;
        }
        const response = await api.post('/cart/quote', { items: items });
        setCart(response.data);
    };

    // load the latest priced cart (called by the Header when the app starts and after log in / log out)
    const fetchCart = async () => {
        if (user) {
            const response = await api.get('/cart');
            setCart(response.data);
        } else {
            await priceGuestCart(guestCart);
        }
    };

    // add several sizes at once: items = [{ variantId, quantity }] from the product page
    const addToCart = async (items) => {
        if (user) {
            // merge adds each quantity on top of what is already saved (capped at the stock), in one request
            const response = await api.post('/cart/merge', { items: items });
            setCart(response.data);
        } else {
            // copy the list, then for each item: add to the quantity if it's already there, or add a new row
            const newGuestCart = [...guestCart];
            for (const item of items) {
                const index = newGuestCart.findIndex(guestItem => guestItem.variantId === item.variantId);
                if (index === -1) {
                    newGuestCart.push({ variantId: item.variantId, quantity: item.quantity });
                } else {
                    newGuestCart[index] = {
                        variantId: item.variantId,
                        quantity: newGuestCart[index].quantity + item.quantity,
                    };
                }
            }
            saveGuestCart(newGuestCart);
            await priceGuestCart(newGuestCart);
        }
    };
    // empty the guest cart
    const clearGuestCart = () => {
        saveGuestCart([]);
        setCart(emptyCart);
    };

    return { cart, fetchCart, addToCart, clearGuestCart };
};
