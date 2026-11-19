// the home page (/): hero, three benefits, the four categories and the squad kit box (home wireframe)
import { Link } from 'wouter';
import { useAdvisor } from '../stores/AdvisorStore';
import '../components/ProductCard.css'; // reuses the product card look (.kg-card, .kg-card-image...)
import './HomePage.css';

// the strip under the hero: one icon and one line each
const benefits = [
    { icon: 'bi-check-lg', text: 'Bulk pricing applied instantly' },
    { icon: 'bi-grid-3x3-gap', text: 'Order every size at once' },
    { icon: 'bi-truck', text: 'Free delivery on 15+ items' },
];

// the four category cards; the ids are the category ids in the database (seed.sql)
const categories = [
    { id: 1, name: 'Matchday Kits', text: 'Jerseys, shorts and socks for match day.', button: 'Shop Match Kits' },
    { id: 2, name: 'Training Wear', text: 'Training tees, tracksuits and warm-ups.', button: 'Shop Training Wear' },
    { id: 3, name: 'Training Equipment', text: 'Bibs, cones, balls and gear bags.', button: 'Shop Equipment' },
    { id: 4, name: 'Coach & Staff Apparel', text: 'Polos, padded jackets and caps.', button: 'Shop Staff Apparel' },
];

export default function HomePage() {
    const { setIsOpen } = useAdvisor(); // only needs to OPEN the Kit Advisor

    return (
        <>
            {/* hero: the navy box at the top */}
            <section className="kg-hero">
                <h1 className="kg-hero-title">Elevate your club's identity</h1>
                <p className="kg-hero-text">Matchday kits, training gear and staff apparel for amateur and youth squads.</p>
                <p className="kg-hero-highlight">Bulk discounts that apply automatically, and every size in one order.</p>
                {/* side by side from md up, stacked on phones */}
                <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
                    <button type="button" className="btn btn-kg-primary btn-lg px-4" onClick={() => setIsOpen(true)}>
                        Ask the Kit Advisor
                    </button>
                    <Link href="/products" className="btn kg-hero-outline btn-lg px-4">Shop all kits</Link>
                </div>
            </section>

            {/* the three benefits */}
            <ul className="kg-benefits">
                {benefits.map(benefit => (
                    <li key={benefit.text}>
                        <span className="kg-benefit-icon"><span className={'bi ' + benefit.icon} aria-hidden="true"></span></span>
                        {benefit.text}
                    </li>
                ))}
            </ul>

            {/* the four categories: 2 per row on phones (col-6), 4 per row on large screens (col-lg-3) */}
            <h2 className="kg-home-heading">Equip your entire club</h2>
            <div className="row g-3 mb-4">
                {categories.map(category => (
                    <div key={category.id} className="col-6 col-lg-3">
                        <div className="kg-card h-100 d-flex flex-column">
                            <div className="kg-card-image">[ {category.name} ]</div>
                            <div className="p-3 d-flex flex-column flex-grow-1">
                                <h3 className="kg-card-title">{category.name}</h3>
                                <p className="kg-card-meta flex-grow-1">{category.text}</p>
                                <Link href={'/products?categoryId=' + category.id} className="btn btn-outline-secondary btn-sm">
                                    {category.button} →
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* build your squad kit: explains mixing items in one order, and the discount tiers */}
            <section className="kg-squad-box">
                <h2 className="kg-squad-title">Build your squad kit</h2>
                <div className="kg-squad-body d-md-flex">
                    <div>
                        <p>
                            Buy different items together as one kit: jerseys, training wear and equipment in a single order.
                            Discounts apply to each item automatically.
                        </p>
                        {/* the same tiers as bulk_discount_rules in seed.sql */}
                        <p className="kg-card-meta small mb-0">
                            Bulk discount per item: 10+ units 10% off · 15+ units 15% off · 25+ units 20% off
                        </p>
                    </div>
                    <div className="kg-squad-actions text-center">
                        <button type="button" className="btn btn-kg-primary w-100 py-2" onClick={() => setIsOpen(true)}>
                            Ask the Kit Advisor
                        </button>
                        <Link href="/products" className="d-inline-block mt-2 fw-semibold">Browse all items →</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
