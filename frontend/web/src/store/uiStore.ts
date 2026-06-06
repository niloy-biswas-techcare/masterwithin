import { create } from 'zustand';

interface UiState {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  setCartOpen: (open) => set({ isCartOpen: open }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
}));
