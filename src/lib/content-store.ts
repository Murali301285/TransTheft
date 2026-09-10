import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type CategoryType = 'course' | 'library';

export interface SubCategory {
    id: string;
    name: string;
    status: 'active' | 'inactive';
}

export interface Category {
    id: string;
    name: string;
    type: CategoryType;
    status: 'active' | 'inactive';
    subCategories: SubCategory[];
}

export interface ContentItem {
    id: string;
    title: string;
    description?: string;
    categoryId: string;
    subCategoryId: string;
    fileUrl?: string; // Mock
    createdAt: string;
    status: 'active' | 'inactive';
}

interface ContentStore {
    categories: Category[];
    content: ContentItem[];

    // Actions
    addCategory: (category: Omit<Category, 'id' | 'subCategories'>) => void;
    updateCategory: (id: string, updates: Partial<Category>) => void;
    addSubCategory: (categoryId: string, name: string) => void;
    toggleCategoryStatus: (id: string) => void;
    toggleSubCategoryStatus: (categoryId: string, subCategoryId: string) => void;

    addContent: (item: Omit<ContentItem, 'id' | 'createdAt'>) => void;
    deleteContent: (id: string) => void;
}

export const useContentStore = create<ContentStore>((set) => ({
    categories: [
        {
            id: '1',
            name: 'Technical Training',
            type: 'course',
            status: 'active',
            subCategories: [
                { id: 'sc1', name: 'Basics', status: 'active' },
                { id: 'sc2', name: 'Advanced', status: 'active' }
            ]
        },
        {
            id: '2',
            name: 'Safety Manuals',
            type: 'library',
            status: 'active',
            subCategories: [
                { id: 'sc3', name: 'Guidelines', status: 'active' }
            ]
        }
    ],
    content: [],

    addCategory: (cat) => set((state) => ({
        categories: [...state.categories, { ...cat, id: uuidv4(), subCategories: [] }]
    })),

    updateCategory: (id, updates) => set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
    })),

    addSubCategory: (catId, name) => set((state) => ({
        categories: state.categories.map(c =>
            c.id === catId
                ? { ...c, subCategories: [...c.subCategories, { id: uuidv4(), name, status: 'active' }] }
                : c
        )
    })),

    toggleCategoryStatus: (id) => set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c)
    })),

    toggleSubCategoryStatus: (catId, subId) => set((state) => ({
        categories: state.categories.map(c =>
            c.id === catId
                ? {
                    ...c,
                    subCategories: c.subCategories.map(s => s.id === subId ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s)
                }
                : c
        )
    })),

    addContent: (item) => set((state) => ({
        content: [...state.content, { ...item, id: uuidv4(), createdAt: new Date().toISOString() }]
    })),

    deleteContent: (id) => set((state) => ({
        content: state.content.filter(c => c.id !== id)
    }))
}));
