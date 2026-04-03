import type { CategoryApi } from "@repo/types";

type CategoryImage = {
    url: string;
    isPrimary: boolean;
};

type CategoryNode = {
    id: string;
    name: string;
    categoryImages?: CategoryImage[];
};

export interface HomeCategoryItem {
    id: string;
    name: string;
    image: string;
}

export interface CategoryCardItem {
    id: string;
    title: string;
    imageUrl: string;
}

const CATEGORY_IMAGE_PLACEHOLDER =
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function toCategoryNode(value: unknown): CategoryNode | null {
    if (!isRecord(value)) {
        return null;
    }

    const id = typeof value.id === "string" ? value.id : null;
    const name = typeof value.name === "string" ? value.name : null;
    if (!id || !name) {
        return null;
    }

    const rawImages = Array.isArray(value.categoryImages) ? value.categoryImages : [];
    const categoryImages: CategoryImage[] = rawImages
        .map((image) => {
            if (!isRecord(image)) {
                return null;
            }

            const url = typeof image.url === "string" ? image.url : null;
            const isPrimary = typeof image.isPrimary === "boolean" ? image.isPrimary : null;
            if (!url || isPrimary === null) {
                return null;
            }

            return { url, isPrimary };
        })
        .filter((image): image is CategoryImage => image !== null);

    return {
        id,
        name,
        categoryImages,
    };
}

function normalizeCategories(categories: unknown[]): CategoryNode[] {
    return categories
        .map((category) => toCategoryNode(category))
        .filter((category): category is CategoryNode => category !== null);
}

function pickCategoryImageByPreference(
    images: CategoryImage[] | undefined,
    prefer: "primary" | "non-primary",
): string {
    if (!images || images.length === 0) {
        return CATEGORY_IMAGE_PLACEHOLDER;
    }

    const preferredImage =
        prefer === "primary"
            ? images.find((image) => image.isPrimary)
            : images.find((image) => !image.isPrimary);

    const fallbackImage =
        prefer === "primary"
            ? images.find((image) => !image.isPrimary)
            : images.find((image) => image.isPrimary);

    return preferredImage?.url || fallbackImage?.url || CATEGORY_IMAGE_PLACEHOLDER;
}

export function mapTopCategoriesForHome(categories: unknown[]): HomeCategoryItem[] {
    return normalizeCategories(categories).map((category) => ({
        id: category.id,
        name: category.name,
        image: pickCategoryImageByPreference(category.categoryImages, "non-primary"),
    }));
}

export function mapTopCategoriesForCategoryTab(
    categories: unknown[],
): CategoryCardItem[] {
    return normalizeCategories(categories).map((category) => ({
        id: category.id,
        title: category.name,
        imageUrl: pickCategoryImageByPreference(category.categoryImages, "primary"),
    }));
}

export function mapSubCategoriesForCards(
    categories: CategoryApi.ResponseTypes["ListCategories"]["data"],
): CategoryCardItem[] {
    return normalizeCategories(categories as unknown[]).map((category) => ({
        id: category.id,
        title: category.name,
        imageUrl: pickCategoryImageByPreference(category.categoryImages, "primary"),
    }));
}
