import { useCallback, useState } from "react";

interface ToggleState {
  isOpen: boolean;
  toggle: () => void;
}

/**
 * Creates boolean state with a stable toggle callback.
 *
 * @returns The current state and its toggle callback.
 */
const useToggle = (initialValue = false): ToggleState => {
  const [isOpen, setIsOpen] = useState(initialValue);

  const toggle = useCallback((): void => {
    setIsOpen((currentValue) => !currentValue);
  }, []);

  return { isOpen, toggle };
};

export { useToggle };
