// the product list page: /products?categoryId=2&size=M&minStock=15
// this first version loads the products for whatever filters are in the address bar and shows them as cards
// the filter sidebar, sort and page buttons come in the next steps: they only change the address bar
import { useState, useEffect } from 'react';
import { Link, useSearch } from 'wouter';
import api from '../api';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';

export default function ProductList() {
  // the text after "?" in the address bar, e.g. "categoryId=2&size=M" ("" when there is none)
  const search = useSearch();

  const [result, setResult] = useState(null);   // { items, page, limit, total, totalPages } from the API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        // send the same filters straight to the API: /products?categoryId=2 → GET /api/products?categoryId=2
        const response = await api.get('/products?' + search);
        setResult(response.data);
      } catch (err) {
        setError("Couldn't load products. Please check your connection and try again.");
      }
      setLoading(false);
    };
    fetchProducts();
  }, [search]); // runs again every time the part after "?" changes (another category, filter, page...)

  // 4 states: loading, error, 
  let content;
  if (loading) {
    content = <p className="kg-card-meta">Loading products…</p>;
  } else if (error) {
    content = <div className="alert alert-danger">{error}</div>;
  } else if (result.items.length === 0) {
    content = (
      <div className="text-center py-5">
        <h3>No products match your filters</h3>
        <p className="kg-card-meta">Try removing a filter or searching for something else.</p>
        <Link href="/products" className="btn btn-kg-primary">Show all products</Link>
      </div>
    );
  } else {
    content = (
      // Bootstrap grid: 1 card per row on phones, 2 on tablets, 3 on laptops (like the wireframe)
      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4">
        {result.items.map(product => (
          <div className="col" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
    {/* title and item count */}
      <div className="d-flex justify-content-between align-items-baseline mb-3">
        <h1>All products</h1>
        {/* only show the count once the products have arrived */}
        {!loading && !error && <span className="kg-card-meta">{result.total} items</span>}
      </div>
      <div className="row g-4">
        <div className="col-lg-3">
            <FilterSidebar />
        </div>
        <div className="col-lg-9">
          {content}  
        </div>
      </div>
    </>
  );
}
