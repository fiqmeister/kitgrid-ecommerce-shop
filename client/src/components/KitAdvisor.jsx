// floating button that opens a chat panel
// the AI work happens in N8N; this component only talks to our own API (POST /api/advisor)
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useUser } from '../stores/UserStore';
import api from '../api';
import './KitAdvisor.css';
import AdvisorSuggestion from './AdvisorSuggestion';

// first message in each tab
const greetings = {
    team: 'Tell me about your team and budget, and I\'ll build a kit from what\'s in stock.',
    personal: 'Shopping for yourself? Tell me what position you play, your size and your budget, and I\'ll pick items in stock.',
};

// grey hint text in the message box, one per tab
const placeholders = {
    team: 'Squad size, age group, budget…',
    personal: 'Your position, size and budget…',
};

// the CSS classes for each kind of bubble
const bubbleClasses = {
    customer: 'kg-advisor-bubble kg-advisor-bubble-customer', // blue, on the right
    advisor: 'kg-advisor-bubble',                            // grey, on the left
    error: 'kg-advisor-bubble kg-advisor-bubble-error',      // red text
};

export default function KitAdvisor() {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false); // panel shown or hidden
    const [mode, setMode] = useState('team'); // 'team' or 'personal' tab
    const [messages, setMessages] = useState([]); // the chat: [{ from: 'customer' | 'advisor' | 'error', text, suggestion }]
    const [text, setText] = useState(''); // what is typed in the message box right now
    const [isSending, setIsSending] = useState(false); // true while waiting for the AI (5 to 15 seconds)
    // first name only, for the greeting: "Daniel Lim" → ["Daniel", "Lim"] → "Daniel"
    const firstName = user ? user.name.split(' ')[0] : '';
    // the id of whoever is logged in, or null for a guest
    const userId = user ? user.id : null;

    // a different person (log out, log in as someone else): start a fresh, closed advisor,
    useEffect(() => {
        setMessages([]);
        setText('');
        setMode('team');
        setIsOpen(false);
    }, [userId]);


    // changing tab starts a fresh chat (each message is answered on its own anyway)
    const changeMode = (newMode) => {
        setMode(newMode);
        setMessages([]);
    };

    // the form's submit: the arrow button or Enter
    const sendMessage = async (event) => {
        event.preventDefault(); // stop the browser reloading the page
        const message = text.trim();
        if (message === '' || isSending) {
            return; // nothing typed, or still waiting for the last answer
        }

        // show the customer's message straight away and empty the box
        // withQuestion is kept in a variable: after the await, "messages" would still be the OLD list
        const withQuestion = [...messages, { from: 'customer', text: message }];
        setMessages(withQuestion);
        setText('');
        setIsSending(true);

        try {
            const response = await api.post('/advisor', { message: message, mode: mode });
            // the reply, plus the checked suggestion (or null)
            setMessages([...withQuestion, {
                from: 'advisor',
                text: response.data.reply,
                suggestion: response.data.suggestion,
            }]);
        } catch (err) {
            // 503: N8N or the AI is down; no response at all: Express is not running
            let errorText;
            if (err.response) {
                errorText = err.response.data.error;
            } else {
                errorText = 'Cannot reach the server. Please try again later.';
            }
            setMessages([...withQuestion, { from: 'error', text: errorText }]);
        }
        setIsSending(false);
    };

    // closed: the floating button with icon only
    if (!isOpen) {
        return (
            <button type="button" className="kg-advisor-button" onClick={() => setIsOpen(true)} aria-label="Ask the Kit Advisor">
                <span className="bi bi-chat-square-text" aria-hidden="true"></span>
                <span className="d-none d-md-inline">Ask the Kit Advisor</span>
            </button>
        );
    }

    // open: the panel takes the button's place
    return (
        <section className="kg-advisor-panel" aria-label="Kit Advisor">
            {/* navy header with the close button */}
            <div className="kg-advisor-header">
                <span className="kg-advisor-header-icon"><span className="bi bi-chat-square-text" aria-hidden="true"></span></span>
                <div>
                    <p className="kg-advisor-title">Kit Advisor</p>
                    <p className="kg-advisor-subtitle">Checks live stock before it suggests</p>
                </div>
                <button type="button" className="kg-advisor-close" aria-label="Close Kit Advisor"
                    onClick={() => setIsOpen(false)}>
                    ×
                </button>
            </div>

            {/* guests: the advisor needs a login (it protects the free AI quota), so only a link */}
            {!user && (
                <div className="kg-advisor-body">
                    <div className="kg-advisor-bubble">
                        Log in to use the Kit Advisor. Tell it your squad size and budget, and it builds a kit from what's in stock.
                    </div>
                    <Link href="/login" className="btn btn-kg-primary align-self-start" onClick={() => setIsOpen(false)}>
                        Log in or register
                    </Link>
                </div>
            )}

            {/* logged in: the two tabs and the chat */}
            {user && (
                <>
                    {/* the tabs are locked while waiting, so an answer can't land in the other tab */}
                    <div className="kg-advisor-tabs">
                        <button type="button"
                            className={'kg-advisor-tab' + (mode === 'team' ? ' active' : '')}
                            aria-pressed={mode === 'team'}
                            disabled={isSending}
                            onClick={() => changeMode('team')}>
                            For my team
                        </button>
                        <button type="button"
                            className={'kg-advisor-tab' + (mode === 'personal' ? ' active' : '')}
                            aria-pressed={mode === 'personal'}
                            disabled={isSending}
                            onClick={() => changeMode('personal')}>
                            For me
                        </button>
                    </div>

                    {/* kg-advisor-chat keeps the newest message in view (see the CSS) */}
                    <div className="kg-advisor-body kg-advisor-chat">
                        <div className="kg-advisor-messages">
                            <div className="kg-advisor-bubble">Hi {firstName}! {greetings[mode]}</div>

                            {/* each message is a bubble; an advisor message with a suggestion also gets the card under it
                                (customer and error messages have no suggestion, and "no items" answers have null) */}
                            {messages.map((message, index) => (
                                <div key={index} className="kg-advisor-entry">
                                    <div className={bubbleClasses[message.from]}
                                        role={message.from === 'error' ? 'alert' : undefined}>
                                        {message.text}
                                    </div>
                                    {message.suggestion && <AdvisorSuggestion suggestion={message.suggestion} />}
                                </div>
                            ))}


                            {/* while waiting: a small spinner (Bootstrap) */}
                            {isSending && (
                                <div className="kg-advisor-bubble">
                                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                    Checking live stock…
                                </div>
                            )}
                        </div>
                    </div>

                    {/* the message box: maxLength matches the server's max(500) */}
                    <form className="kg-advisor-form" onSubmit={sendMessage}>
                        <input type="text" className="form-control kg-advisor-input"
                            placeholder={placeholders[mode]}
                            aria-label="Message to the Kit Advisor"
                            maxLength={500}
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                            disabled={isSending} />
                        <button type="submit" className="kg-advisor-send" aria-label="Send"
                            disabled={isSending || text.trim() === ''}>
                            <span className="bi bi-arrow-right" aria-hidden="true"></span>
                        </button>
                    </form>
                    <p className="kg-advisor-note">AI suggestions use live stock. Check sizes before paying.</p>
                </>
            )}
        </section>
    );
}
