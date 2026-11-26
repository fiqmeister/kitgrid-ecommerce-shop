// the product list page: /products?categoryId=2&size=M&minStock=15
import { useState, useEffect } from 'react';
import { Link, useSearch, useLocation } from 'wouter';
import api from '../api';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import ActiveFilters from '../components/ActiveFilters';
import categories from '../categories';
import Pagination from '../components/Pagination';
import PageState from '../components/PageState';

export default function ProductList() {
    // the text after "?" in the address bar, e.g. "categoryId=2&size=M" ("" when there is none)
    const search = useSearch();

    const [location, navigate] = useLocation();
    const params = new URLSearchParams(search);

    //  the title: the search word, category name or 'All products'
    let title = 'All products';
    const category = categories.find(item => String(item.id) === params.get('categoryId'));
    if (category) {
        title = category.name;
    }
    if (params.get('search')) {
        title = 'Results for "' + params.get('search') + '"';
    }

    // the sort dropdown: 'newest' default
    const sort = params.get('sort') || 'newest';
    function changeSort(event) {
        const newParams = new URLSearchParams(search);
        newParams.set('sort', event.target.value);
        newParams.delete('page');
        navigate('/products?' + newParams.toString());
    }

    const [result, setResult] = useState(null);   // { items, page, limit, total, totalPages } from the API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Try again adds 1 to this number; useEffect is watching it, so it loads the products again
    const [reloadCount, setReloadCount] = useState(0);

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
    }, [search, reloadCount]); // runs again when the part after "?" changes, or when Try again is clicked

    // 4 states: loading, error, nothing found, the products
    let content;
    if (loading) {
        // grey placeholder cards in the same grid as the real cards (states wireframe: "Loading kits...")
        content = (
            <>
                <p className="kg-card-meta">
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    Loading kits…
                </p>
                {/* placeholder-glow: Bootstrap makes the grey bars fade in and out */}
                <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4 placeholder-glow" aria-hidden="true">
                    {[1, 2, 3].map(number => (
                        <div className="col" key={number}>
                            <div className="kg-card h-100">
                                <div className="kg-card-image"></div>
                                <div className="p-3">
                                    <span className="placeholder d-block col-8 mb-2"></span>
                                    <span className="placeholder d-block col-5 mb-3"></span>
                                    <span className="placeholder placeholder-lg d-block col-12"></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    } else if (error) {
        content = (
            <PageState icon="bi-exclamation-lg" title="We couldn't load the products" text="Check your connection and try again." isError={true}>
                <button type="button" className="btn btn-kg-primary" onClick={() => setReloadCount(reloadCount + 1)}>
                    Try again
                </button>
            </PageState>
        );
    } else if (result.items.length === 0) {
        content = (
            <PageState icon="bi-search" title="No kits match your filters" text="Try removing a filter or searching for something else.">
                <Link href="/products" className="btn btn-kg-primary">Clear all filters</Link>
            </PageState>
        );
    } else {
        content = (
            <>
                {/* Bootstrap grid: 1 card per row on phones, 2 on tablets, 3 on wide screens */}
                <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4">
                    {result.items.map(product => (
                        <div className="col" key={product.id}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
                <Pagination page={result.page} limit={result.limit} total={result.total} totalPages={result.totalPages} />
            </>
        );
    }

    return (
        <>
            {/* title on the left, sort on the right */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h1 className="mb-0 fs-2">{title}</h1>
                <select className="form-select w-auto" value={sort} onChange={changeSort} aria-label="Sort products">
                    <option value="newest">Sort: Newest</option>
                    <option value="price_asc">Sort: Price, low to high</option>
                    <option value="price_desc">Sort: Price, high to low</option>
                </select>
            </div>

            {/* sidebar on the left (1/4), products on the right (3/4); on phones the sidebar sits above */}
            <div className="row g-4">
                <div className="col-lg-3">
                    <FilterSidebar />
                </div>
                <div className="col-lg-9">
                    {/* chips on the left, item count on the right */}
                    <div className="d-flex align-items-start gap-2 mb-3">
                        <ActiveFilters />
                        {!loading && !error && <span className="kg-card-meta ms-auto text-nowrap">{result.total} items</span>}
                    </div>
                    {content}
                </div>
            </div>
        </>
    );

}
