// whether the Kit Advisor panel is open, shared by every component (Jotai)
// so a button anywhere (e.g. on the home page) can open the panel, not only its own floating button
import { atom, useAtom } from 'jotai';

// false = closed when the app starts
export const advisorOpenAtom = atom(false);

// the hook: components use this, the same way they use useUser()
export const useAdvisor = () => {
    const [isOpen, setIsOpen] = useAtom(advisorOpenAtom);
    return { isOpen, setIsOpen };
};