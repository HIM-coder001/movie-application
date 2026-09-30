const SORT_OPTIONS = [
  { value: "popularity.desc",        label: "Most Popular" },
  { value: "vote_average.desc",      label: "Highest Rated" },
  { value: "release_date.desc",      label: "Newest First" },
  { value: "release_date.asc",       label: "Oldest First" },
  { value: "revenue.desc",           label: "Highest Revenue" },
];

const SortDropdown = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-light-200 text-sm whitespace-nowrap">
        Sort by
      </label>
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-light-100/10 text-light-200 text-sm rounded-lg px-3 py-1.5 border border-light-100/20 outline-none cursor-pointer hover:bg-light-100/20 transition"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0f0d23]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortDropdown;
