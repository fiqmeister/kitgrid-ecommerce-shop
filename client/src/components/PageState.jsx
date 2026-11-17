// one card for the empty and error states on every page (states wireframe)
// the page says what to show: the icon, the title, one short line,
// and the buttons between <PageState> and </PageState> (they arrive here as "children")
export default function PageState({ icon, title, text, isError, children }) {
    // the round icon: red for errors, grey for everything else (e.g. an empty cart)
    let iconClass = 'kg-state-icon';
    if (isError) {
        iconClass = 'kg-state-icon kg-state-icon-error';
    }

    return (
        <div className="kg-state">
            {/* aria-hidden: the icon is only decoration, screen readers read the title instead */}
            <span className={iconClass} aria-hidden="true">
                <span className={'bi ' + icon}></span>
            </span>
            <h2 className="kg-state-title">{title}</h2>
            <p className="kg-state-text">{text}</p>
            {/* the page's own buttons or links, e.g. Try again or Shop Matchday Kits */}
            {children}
        </div>
    );
}
