import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'linkvault_settings';

const DEFAULT_SETTINGS = {
  darkMode: true,
};

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch {
      // Use defaults on error
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = useCallback(async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch {
      // Silently fail - settings will reset on next launch
    }
  }, [settings]);

  const toggleDarkMode = useCallback(async () => {
    await updateSetting('darkMode', !settings.darkMode);
  }, [settings.darkMode, updateSetting]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    toggleDarkMode,
    updateSetting,
  };
}
