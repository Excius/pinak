import { ValidationError, NotFoundError } from "../lib/error.js";
import { WishlistRepository } from "../repositories/wishlist.repository.js";

export class WishlistService {
  constructor(private repo: WishlistRepository) {}

  async getWishlist(userId: string) {
    const wishlist = await this.repo.getWishlistWithItems(userId);

    const items = wishlist.items.map((item) => ({
      id: item.id,
      productVariant: item.productVariant,
      addedAt: item.createdAt,
      inStock: item.productVariant.stock > 0,
      stockCount: item.productVariant.stock,
    }));

    return {
      id: wishlist.id,
      userId: wishlist.userId,
      items,
      totalItems: items.length,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  }

  async addToWishlist(userId: string, productVariantId: string) {
    const variant = await this.repo.getVariantById(productVariantId);
    if (!variant) {
      throw new NotFoundError("Product variant not found or inactive");
    }

    const wishlist = await this.repo.findOrCreateWishlist(userId);

    const existingItem = await this.repo.findWishlistItem(
      wishlist.id,
      productVariantId,
    );

    if (existingItem) {
      throw new ValidationError("Item already in wishlist");
    }

    const item = await this.repo.addItem(wishlist.id, productVariantId);

    return {
      message: "Item added to wishlist",
      item: {
        id: item.id,
        productVariant: item.productVariant,
        addedAt: item.createdAt,
      },
    };
  }

  async removeFromWishlist(userId: string, itemId: string) {
    const item = await this.repo.getItemById(itemId);
    if (!item) {
      throw new NotFoundError("Wishlist item not found");
    }

    if (item.wishlist.userId !== userId) {
      throw new ValidationError("This item does not belong to your wishlist");
    }

    await this.repo.removeItem(itemId);

    return { message: "Item removed from wishlist" };
  }

  async clearWishlist(userId: string) {
    const wishlist = await this.repo.findOrCreateWishlist(userId);
    const deletedCount = await this.repo.clearWishlist(wishlist.id);

    return {
      message: "Wishlist cleared",
      deletedCount: deletedCount.count,
    };
  }
}
