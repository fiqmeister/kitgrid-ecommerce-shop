// items: [{ label: 'Home', href: '/' }, { label: 'Matchday Kits', href: '/products?categoryId=1' }, { label: 'Matchday Jersey' }]
import { Link } from 'wouter';
import './Breadcrumb.css';

export default function Breadcrumb({ items }) {
    return (
        <nav className="kg-breadcrumb mb-3" aria-label="Breadcrumb">
            {items.map((item, index) => (
                <span key={index}>
                    {/* a " / " before every item except the first */}
                    {index > 0 && ' / '}
                    {item.href
                        ? <Link href={item.href}>{item.label}</Link>
                        : <span aria-current="page">{item.label}</span>}
                </span>
            ))}
        </nav>
    );
}
