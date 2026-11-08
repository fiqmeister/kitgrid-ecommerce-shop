// the Filters box on the left of the product list
// it never calls the API itself: it only changes the address bar, and ProductList reloads the products ([search] in its useEffect)
import { useState, useEffect } from 'react';
import { useSearch, useLocation } from 'wouter';
import './FilterSidebar.css';

// the choices in the sidebar: exact database values the API matches
const colourOptions = ['Black', 'White', 'Navy', 'Red', 'Yellow', 'Orange', 'Green', 'Grey'];
const sizeOptions = ['S', 'M', 'L', 'XL'];
const ageGroupOptions = [
  { value: '', label: 'Any' },
  { value: 'mini_junior', label: 'Mini / Kids (U6–U9)' },
  { value: 'youth', label: 'Youth (U10–U16)' },
  { value: 'senior', label: 'Senior' },
];

// keeps the address bar tidy: a filter with an empty value is removed instead of sent as "minStock="
function setOrDelete(params, name, value) {
  if (value !== '') {
    params.set(name, value);
  } else {
    params.delete(name);
  }
}

export default function FilterSidebar() {
  const search = useSearch();                // e.g. "categoryId=1&colours=Red,Black"
  const [location, navigate] = useLocation(); // navigate('/products?...') changes the address bar without a reload
  const params = new URLSearchParams(search);

  // what is chosen right now, read from the address bar
  const chosenColours = params.get('colours') ? params.get('colours').split(',') : [];
  const chosenSizes = params.get('size') ? params.get('size').split(',') : [];
  const chosenAgeGroup = params.get('ageGroup') || '';

  // the 3 boxes: what the customer is typing, before pressing Apply
  const [minPrice, setMinPrice] = useState(params.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '');
  const [minStock, setMinStock] = useState(params.get('minStock') || '');
  const [boxError, setBoxError] = useState('');

  // when the address bar changes some other way (Clear all, a category link, the Back button), refill the boxes from it
  useEffect(() => {
    const current = new URLSearchParams(search);
    setMinPrice(current.get('minPrice') || '');
    setMaxPrice(current.get('maxPrice') || '');
    setMinStock(current.get('minStock') || '');
    setBoxError('');
  }, [search]);

  // put the new filters in the address bar; ProductList sees the change and loads the products
  function goTo(newParams) {
    newParams.delete('page'); // any filter change starts again at page 1
    navigate('/products?' + newParams.toString());
  }

  // tick or untick one value in a comma list: name is 'colours' or 'size'
  function toggleInList(name, chosen, value) {
    let updated;
    if (chosen.includes(value)) {
      updated = chosen.filter(item => item !== value); // untick: remove it
    } else {
      updated = chosen.concat([value]);                // tick: add it
    }
    const newParams = new URLSearchParams(search);
    setOrDelete(newParams, name, updated.join(','));   // [] joins to '' → filter removed
    goTo(newParams);
  }

  // one age group (radio): '' means Any
  function chooseAgeGroup(value) {
    const newParams = new URLSearchParams(search);
    setOrDelete(newParams, 'ageGroup', value);
    goTo(newParams);
  }

  // the Apply button (or Enter in one of the boxes)
  function applyBoxes(event) {
    event.preventDefault(); // stop the normal form behaviour (a full page reload)
    // same rule as productService, checked here first so the customer gets a clear message
    if (minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice)) {
      setBoxError('Minimum price cannot be higher than maximum price.');
      return;
    }
    const newParams = new URLSearchParams(search);
    setOrDelete(newParams, 'minPrice', minPrice);
    setOrDelete(newParams, 'maxPrice', maxPrice);
    setOrDelete(newParams, 'minStock', minStock);
    goTo(newParams);
  }

  // remove the sidebar filters, but keep the category, the search words and the sort the customer chose elsewhere
  function clearAll() {
    const current = new URLSearchParams(search);
    const newParams = new URLSearchParams();
    setOrDelete(newParams, 'categoryId', current.get('categoryId') || '');
    setOrDelete(newParams, 'search', current.get('search') || '');
    setOrDelete(newParams, 'sort', current.get('sort') || '');
    goTo(newParams);
  }

  return (
    <aside className="kg-filters">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="kg-filters-title">Filters</h2>
        <button type="button" className="kg-link-button" onClick={clearAll}>Clear all</button>
      </div>

      {/* one form, so Enter in any box presses Apply */}
      <form onSubmit={applyBoxes}>
        <div className="kg-filter-group">
          <h3 className="kg-filter-label">Price (S$)</h3>
          <div className="d-flex align-items-center gap-2">
            <input type="number" className="form-control" min="0" step="0.01" placeholder="Min"
              aria-label="Minimum price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            <span className="kg-card-meta">to</span>
            <input type="number" className="form-control" min="0" step="0.01" placeholder="Max"
              aria-label="Maximum price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
        </div>

        <div className="kg-filter-group">
          <h3 className="kg-filter-label">Colour</h3>
          {colourOptions.map(colour => (
            <div className="form-check" key={colour}>
              <input className="form-check-input" type="checkbox" id={'colour-' + colour}
                checked={chosenColours.includes(colour)}
                onChange={() => toggleInList('colours', chosenColours, colour)} />
              <label className="form-check-label d-flex align-items-center gap-2" htmlFor={'colour-' + colour}>
                <span className="kg-colour-dot" style={{ backgroundColor: colour }}></span>
                {colour}
              </label>
            </div>
          ))}
        </div>

        <div className="kg-filter-group">
          <h3 className="kg-filter-label">Age group</h3>
          {ageGroupOptions.map(option => (
            <div className="form-check" key={option.value}>
              <input className="form-check-input" type="radio" name="ageGroup" id={'age-' + (option.value || 'any')}
                checked={chosenAgeGroup === option.value}
                onChange={() => chooseAgeGroup(option.value)} />
              <label className="form-check-label" htmlFor={'age-' + (option.value || 'any')}>{option.label}</label>
            </div>
          ))}
        </div>

        <div className="kg-filter-group">
          <h3 className="kg-filter-label">Size</h3>
          <div className="d-flex gap-2">
            {sizeOptions.map(size => (
              // type="button" so clicking a chip does NOT submit the form
              <button type="button" key={size}
                className={'kg-size-chip' + (chosenSizes.includes(size) ? ' active' : '')}
                aria-pressed={chosenSizes.includes(size)}
                onClick={() => toggleInList('size', chosenSizes, size)}>
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="kg-filter-group">
          <h3 className="kg-filter-label">Minimum in stock</h3>
          <input type="number" className="form-control kg-stock-box" min="1" step="1" placeholder="e.g. 15"
            aria-label="Minimum in stock" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
          <p className="kg-filter-hint mb-0">Total across all sizes</p>
        </div>

        {boxError && <p className="text-danger small mb-2">{boxError}</p>}
        <button type="submit" className="btn btn-kg-primary w-100">Apply</button>
      </form>
    </aside>
  );
}
