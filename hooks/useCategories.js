import { useState, useCallback } from 'react';
import { categoryRepository } from '../database/categoryRepository';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryRepository.getAll();
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = useCallback(async ({ name, color }) => {
    setError(null);
    try {
      await categoryRepository.create({ name, color });
      await loadCategories();
    } catch (err) {
      setError(err.message || 'Gagal menambah kategori');
      throw err;
    }
  }, [loadCategories]);

  const editCategory = useCallback(async (id, { name, color }) => {
    setError(null);
    try {
      await categoryRepository.update(id, { name, color });
      await loadCategories();
    } catch (err) {
      setError(err.message || 'Gagal mengedit kategori');
      throw err;
    }
  }, [loadCategories]);

  const deleteCategory = useCallback(async (id) => {
    setError(null);
    try {
      await categoryRepository.remove(id);
      await loadCategories();
    } catch (err) {
      setError(err.message || 'Gagal menghapus kategori');
      throw err;
    }
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    loadCategories,
    addCategory,
    editCategory,
    deleteCategory,
  };
}
