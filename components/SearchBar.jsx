import React, { useMemo, useState } from "react";

const DEFAULT_PLACEHOLDER = "Discover your next expedition.";

const SearchIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    focusable="false"
    className="search-bar__icon"
  >
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const FilterIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    focusable="false"
    className="search-bar__action-icon"
  >
    <path
      d="M4 6h16M7 12h10M10 18h4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

function highlightMatch(label, query) {
  if (!query) return label;
  const normalized = label.toLowerCase();
  const idx = normalized.indexOf(query);
  if (idx === -1) return label;
  const before = label.slice(0, idx);
  const match = label.slice(idx, idx + query.length);
  const after = label.slice(idx + query.length);
  return (
    <>
      {before}
      <span className="search-bar__match">{match}</span>
      {after}
    </>
  );
}

export default function SearchBar({
  destinations = [],
  onSelect,
  placeholder = DEFAULT_PLACEHOLDER,
  showActionIcon = false,
  onAction,
}) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();
  const isTyping = normalizedQuery.length > 0;

  const filteredResults = useMemo(() => {
    if (!normalizedQuery) return destinations;
    return destinations.filter((destination) =>
      destination?.name?.toLowerCase().includes(normalizedQuery)
    );
  }, [destinations, normalizedQuery]);

  const handleSelect = (destination) => {
    if (onSelect) {
      onSelect(destination);
    }
    setQuery(destination?.name ?? "");
  };

  return (
    <div
      className={[
        "search-bar",
        isFocused ? "is-focused" : "",
        isTyping ? "is-typing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="search-bar__field">
        <SearchIcon />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="search-bar__input"
          aria-label="Search destinations"
        />
        {showActionIcon ? (
          <button
            type="button"
            className="search-bar__action"
            aria-label="Filter destinations"
            onClick={onAction}
          >
            <FilterIcon />
          </button>
        ) : null}
      </div>
      {isTyping ? (
        <div className="search-bar__results" role="listbox">
          {filteredResults.map((destination) => (
            <button
              type="button"
              key={destination.id}
              className="search-bar__result"
              role="option"
              onClick={() => handleSelect(destination)}
            >
              {highlightMatch(destination.name ?? "", normalizedQuery)}
            </button>
          ))}
          {filteredResults.length === 0 ? (
            <div className="search-bar__empty">No matching destinations.</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
