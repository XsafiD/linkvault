import { useState, useCallback, useRef, useEffect } from 'react';

export function useSearch(data = []) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(data);
  const debounceRef = useRef(null);

  const filterData = useCallback((searchQuery, sourceData) => {
    if (!searchQuery.trim()) {
      return sourceData;
    }
    const lowerQuery = searchQuery.toLowerCase();
    return sourceData.filter((item) => {
      const title = (item.title || '').toLowerCase();
      const categoryName = (item.category_name || '').toLowerCase();
      const url = (item.url || '').toLowerCase();
      return (
        title.includes(lowerQuery) ||
        categoryName.includes(lowerQuery) ||
        url.includes(lowerQuery)
      );
    });
  }, []);

  const handleSearch = useCallback((text, currentData) => {
    setQuery(text);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const sourceData = currentData || data;
    debounceRef.current = setTimeout(() => {
      setResults(filterData(text, sourceData));
    }, 300);
  }, [data, filterData]);

  const clearSearch = useCallback((currentData) => {
    setQuery('');
    setResults(currentData || data);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, [data]);

  useEffect(() => {
    setResults(query ? filterData(query, data) : data);
  }, [data, query, filterData]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    query,
    results,
    handleSearch,
    clearSearch,
  };
}
