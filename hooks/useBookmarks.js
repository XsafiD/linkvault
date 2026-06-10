import { useState, useCallback } from 'react';
import { bookmarkRepository } from '../database/bookmarkRepository';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookmarkRepository.getAll();
      setBookmarks(data);
    } catch (err) {
      setError(err.message || 'Gagal memuat bookmark');
    } finally {
      setLoading(false);
    }
  }, []);

  const addBookmark = useCallback(async (data) => {
    setError(null);
    try {
      await bookmarkRepository.create(data);
      await loadBookmarks();
    } catch (err) {
      setError(err.message || 'Gagal menambah bookmark');
      throw err;
    }
  }, [loadBookmarks]);

  const editBookmark = useCallback(async (id, data) => {
    setError(null);
    try {
      await bookmarkRepository.update(id, data);
      await loadBookmarks();
    } catch (err) {
      setError(err.message || 'Gagal mengedit bookmark');
      throw err;
    }
  }, [loadBookmarks]);

  const deleteBookmark = useCallback(async (id) => {
    setError(null);
    try {
      await bookmarkRepository.remove(id);
      await loadBookmarks();
    } catch (err) {
      setError(err.message || 'Gagal menghapus bookmark');
      throw err;
    }
  }, [loadBookmarks]);

  const searchBookmarks = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const data = query
        ? await bookmarkRepository.search(query)
        : await bookmarkRepository.getAll();
      setBookmarks(data);
    } catch (err) {
      setError(err.message || 'Gagal mencari bookmark');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bookmarks,
    loading,
    error,
    loadBookmarks,
    addBookmark,
    editBookmark,
    deleteBookmark,
    searchBookmarks,
  };
}
