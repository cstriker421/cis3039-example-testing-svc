import { describe, it, expect } from 'vitest';
import { listProducts } from './list-products';
import { FakeProductRepo } from '../infra/fake-product-repo';
import { Product } from '../domain/product';

// The repo type, taken from listProducts itself so no extra import path is needed
type ProductRepo = Parameters<typeof listProducts>[0]['productRepo'];

describe('listProducts', () => {
  it('should return empty array when no products exist', async () => {
    // Arrange
    const productRepo = new FakeProductRepo();

    // Act
    const result = await listProducts({ productRepo });

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('should return all products from the repository', async () => {
    // Arrange
    const products: Product[] = [
      {
        id: 'prod-1',
        name: 'Product 1',
        pricePence: 1000,
        description: 'First product',
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: 'prod-2',
        name: 'Product 2',
        pricePence: 2000,
        description: 'Second product',
        updatedAt: new Date('2025-01-02'),
      },
    ];
    const productRepo = new FakeProductRepo(products);

    // Act
    const result = await listProducts({ productRepo });

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data).toEqual(products);
  });

  describe('error scenarios', () => {
    it('should handle repository errors gracefully', async () => {
      // Arrange: a mock repo whose list() throws on purpose
      const errorMessage = 'Database unavailable';
      const productRepo: ProductRepo = {
        list: async () => {
          throw new Error(errorMessage);
        },
        // No-op implementations so the object matches the repository interface
        getById: async () => null,
        save: async (p: any) => p,
        delete: async () => {},
      };

      // Act
      const result = await listProducts({ productRepo });

      // Assert: the failure becomes a result object instead of exception
      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
    });
  });
});