import { useState, useEffect, useCallback } from "react";
export function useLocal(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const r = window.localStorage.getItem(key);
      return r ? JSON.parse(r) : initial;
    } catch (e) {
      return initial;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }, [key, value]);
  return [value, useCallback((v) => setValue(v), [])];
}
