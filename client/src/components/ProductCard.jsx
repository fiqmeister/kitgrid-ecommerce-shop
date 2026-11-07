// one product in the product grid: image box, name, age group, colour dots, bulk price, price, stock, button
import { Link } from 'wouter';
import './ProductCard.css';

// database values → the words the customer sees (same wording as the wireframe's Age group filter)
const ageGroupLabels = {
  mini_junior: 'Mini (U6–U9)',
  youth: 'Youth (U10–U16)',
  senior: 'Senior',
};

// product: one item from GET /api/products, e.g. { id, name, basePrice, colours, ageGroups, totalStock, bulkFromPrice, ... }
export default function ProductCard({ product }) {
  return (
    <div className="kg-card h-100 d-flex flex-column">
      {/* grey box until products have images (same as the wireframe) */}
      <div className="kg-card-image">[ {product.category} ]</div>

      <div className="p-3 d-flex flex-column flex-grow-1">
        <h3 className="kg-card-title">{product.name}</h3>

        {/* only shown when the product has age groups */}
        {product.ageGroups.length > 0 && (
          <p className="kg-card-meta mb-1">
            Age group: {product.ageGroups.map(group => ageGroupLabels[group]).join(', ')}
          </p>
        )}

        {/* one dot per colour; the colour name from the database IS a CSS colour ("Navy", "Red"...) */}
        <div className="d-flex align-items-center gap-1 mb-2 kg-card-meta">
          {product.colours.map(colour => (
            <span key={colour} className="kg-colour-dot" style={{ backgroundColor: colour }} title={colour}></span>
          ))}
          <span className="ms-1">
            {product.colours.length} {product.colours.length === 1 ? 'colour' : 'colours'}
          </span>
        </div>

        {/* null when the product has no bulk discount (e.g. Coach Padded Jacket) */}
        {product.bulkFromPrice !== null && (
          <span className="kg-bulk-chip mb-2">Bulk from S${product.bulkFromPrice.toFixed(2)}</span>
        )}

        <p className="kg-card-price mb-1">
          S${product.basePrice.toFixed(2)} <span className="kg-card-unit">/ unit</span>
        </p>

        {product.totalStock > 0
          ? <p className="kg-stock-in mb-3">● In stock</p>
          : <p className="kg-stock-out mb-3">Out of stock</p>}

        {/* mt-auto pushes the button to the bottom, so all buttons in a row line up */}
        <Link href={'/products/' + product.id} className="btn btn-kg-dark mt-auto">Select sizes</Link>
      </div>
    </div>
  );
}
