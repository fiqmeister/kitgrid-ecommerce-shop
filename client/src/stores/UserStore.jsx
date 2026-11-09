// the logged-in customer, shared by every component (Jotai), plus the functions that save and clear the login
import { atom, useAtom } from 'jotai';

// read the saved customer when the app starts, so the name is still known after F5
// localStorage only stores text: the user was saved with JSON.stringify, so JSON.parse turns it back into an object
// (nothing saved → getItem gives null → JSON.parse(null) is null → nobody logged in)
const getUserFromStorage = () => {
    return JSON.parse(localStorage.getItem('user'));
};

// the atom: { id, name, email, role }, or null when nobody is logged in
export const userAtom = atom(getUserFromStorage());

// the hook: components use this instead of touching localStorage themselves
export const useUser = () => {
    const [user, setUser] = useAtom(userAtom);

    // after a successful login: data is the API's answer { user, accessToken, refreshToken }
    const saveLogin = (data) => {
        localStorage.setItem('accessToken', data.accessToken);   // api.js reads these two
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user)); // object → text
        setUser(data.user); // every component using the atom (the Header) updates straight away
    };

    // on log out: forget everything
    const clearLogin = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
    };

    return { user, saveLogin, clearLogin };
};
