// the page buttons: "Showing 1–12 of 17" and ‹ 1 2 › (used by /products and /orders)
import { useSearch, useLocation } from 'wouter';
import './Pagination.css';

// page, limit, total, totalPages: passed in straight from the API's answer
export default function Pagination({ page, limit, total, totalPages }) {
  const search = useSearch();
  const [location, navigate] = useLocation();

  // go to another page: copy the URL so every filter and the sort stay, change only the page
  function goToPage(number) {
    const newParams = new URLSearchParams(search);
    newParams.set('page', number);
    navigate(location + '?' + newParams.toString()); // stay on this page (/products or /orders), change only when ?page=
    window.scrollTo(0, 0); // back to the top, so the customer sees the first card of the new page
  }

  // only one page: no buttons needed
  if (totalPages <= 1) {
    return null;
  }

  // "Showing 13–17 of 17": the first and last item number on this page
  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total); // the last page may not be full

  // one button per page: [1, 2, 3, ...]
  const pageNumbers = [];
  for (let number = 1; number <= totalPages; number++) {
    pageNumbers.push(number);
  }

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-4">
      <span className="kg-card-meta">Showing {first}–{last} of {total}</span>

      <nav className="d-flex gap-2" aria-label="Pages">
        <button type="button" className="kg-page-btn" aria-label="Previous page"
          disabled={page === 1} onClick={() => goToPage(page - 1)}>‹</button>

        {pageNumbers.map(number => (
          <button type="button" key={number}
            className={'kg-page-btn' + (number === page ? ' active' : '')}
            aria-current={number === page ? 'page' : undefined}
            onClick={() => goToPage(number)}>
            {number}
          </button>
        ))}

        <button type="button" className="kg-page-btn" aria-label="Next page"
          disabled={page === totalPages} onClick={() => goToPage(page + 1)}>›</button>
      </nav>
    </div>
  );
}
