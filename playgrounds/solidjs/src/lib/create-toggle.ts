import { createSignal, type Accessor } from "solid-js";

interface ToggleState {
  isOpen: Accessor<boolean>;
  toggle: () => void;
}

/**
 * Creates a boolean signal and a function that toggles its value.
 *
 * @returns The signal accessor and its toggle function.
 */
const createToggle = (initialValue = false): ToggleState => {
  const [isOpen, setIsOpen] = createSignal(initialValue);

  const toggle = (): void => {
    setIsOpen((currentValue) => !currentValue);
  };

  return { isOpen, toggle };
};

export { createToggle };
