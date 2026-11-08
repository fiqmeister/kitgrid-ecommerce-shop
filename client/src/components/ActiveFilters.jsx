// the chips above the product grid: one chip per filter in the address bar, × removes just that one (kitgrid_product_list_v2)
import { useSearch, useLocation } from 'wouter';
import './ActiveFilters.css';

const ageGroupLabels = {
  mini_junior: 'Mini / Kids (U6–U9)',
  youth: 'Youth (U10–U16)',
  senior: 'Senior',
};

export default function ActiveFilters() {
  const search = useSearch();
  const [location, navigate] = useLocation();
  const params = new URLSearchParams(search);

  // build the chips. label: what the customer sees. name: which filter it is. value: only for lists (colours, size)
  const chips = [];
  if (params.get('search')) {
    chips.push({ label: '"' + params.get('search') + '"', name: 'search' });
  }
  if (params.get('colours')) {
    params.get('colours').split(',').forEach(colour => {
      chips.push({ label: colour, name: 'colours', value: colour });
    });
  }
  if (params.get('size')) {
    params.get('size').split(',').forEach(size => {
      chips.push({ label: 'Size ' + size, name: 'size', value: size });
    });
  }
  if (params.get('ageGroup')) {
    chips.push({ label: ageGroupLabels[params.get('ageGroup')], name: 'ageGroup' });
  }
  if (params.get('minPrice')) {
    chips.push({ label: 'From S$' + params.get('minPrice'), name: 'minPrice' });
  }
  if (params.get('maxPrice')) {
    chips.push({ label: 'Up to S$' + params.get('maxPrice'), name: 'maxPrice' });
  }
  if (params.get('minStock')) {
    chips.push({ label: params.get('minStock') + '+ in stock', name: 'minStock' });
  }

  // no filters chosen: show nothing at all
  if (chips.length === 0) {
    return null;
  }

  function removeChip(chip) {
    const newParams = new URLSearchParams(search);
    if (chip.value) {
      // colours / size: take only this one value out of the comma list
      const remaining = newParams.get(chip.name).split(',').filter(item => item !== chip.value);
      if (remaining.length > 0) {
        newParams.set(chip.name, remaining.join(','));
      } else {
        newParams.delete(chip.name);
      }
    } else {
      newParams.delete(chip.name);
    }
    newParams.delete('page'); // a filter change starts again at page 1
    navigate('/products?' + newParams.toString());
  }

  return (
    <div className="d-flex flex-wrap gap-2">
      {chips.map(chip => (
        <button type="button" key={chip.name + (chip.value || '')} className="kg-filter-chip"
          aria-label={'Remove filter ' + chip.label} onClick={() => removeChip(chip)}>
          {chip.label} <span aria-hidden="true">×</span>
        </button>
      ))}
    </div>
  );
}
