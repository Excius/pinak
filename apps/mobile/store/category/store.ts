import { create } from 'zustand';

interface CategoryStore {
    selectedCategory: string | null;
    selectCategory: (categoryId: string) => void;
    clearCategory: () => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
    selectedCategory: null,
    selectCategory: (categoryId) => set({ selectedCategory: categoryId }),
    clearCategory: () => set({ selectedCategory: null }),
}));