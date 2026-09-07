const categories = [
  'Electronics',
  'Documents',
  'Clothing',
  'Accessories',
  'Keys',
  'Bags',
  'Pets',
  'Other'
];

export default function ReportFilters({ filters, onChange, onClear }) {
  const updateFilter = (name, value) => {
    onChange({ ...filters, [name]: value });
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <section className="filters-panel" aria-labelledby="filter-heading">
      <div className="section-label-row">
        <div>
          <p className="eyebrow">Find a report</p>
          <h2 id="filter-heading">Search the desk</h2>
        </div>
        {hasFilters && (
          <button className="text-button" type="button" onClick={onClear}>
            Clear filters
          </button>
        )}
      </div>
      <div className="filter-grid">
        <label className="search-field">
          <span>Keyword</span>
          <input
            type="search"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Search title, place, or detail"
          />
        </label>
        <label>
          <span>Report type</span>
          <select value={filters.type} onChange={(event) => updateFilter('type', event.target.value)}>
            <option value="">All types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
        </label>
        <label>
          <span>Category</span>
          <select value={filters.category} onChange={(event) => updateFilter('category', event.target.value)}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <label>
          <span>Status</span>
          <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>
      </div>
    </section>
  );
}
