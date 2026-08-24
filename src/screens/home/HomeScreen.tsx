import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { PRODUCTS_QUERY, CATEGORIES_QUERY } from '../../api/graphql/products.graphql';
import ProductCard from '../../components/ProductCard';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { Product, Category } from '../../types';

const PER_PAGE = 10;

type CategoriesQueryData = {
  categories: Category[];
};

type ProductsQueryData = {
  products: Product[] | {
    nodes: Product[];
    totalCount?: number;
    hasNextPage?: boolean;
  };
};

// Home Screen
export default function HomeScreen({ navigation }: any) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const { data: categoriesData } = useQuery<CategoriesQueryData>(CATEGORIES_QUERY);

  const { data, loading, error, refetch, fetchMore } = useQuery<ProductsQueryData>(PRODUCTS_QUERY, {
    variables: {
      categoryId: selectedCategoryId,
      page,
      perPage: PER_PAGE,
    },
    notifyOnNetworkStatusChange: true,
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await refetch({ categoryId: selectedCategoryId, page: 1, perPage: PER_PAGE });
    setRefreshing(false);
  }, [refetch, selectedCategoryId]);

  const handleLoadMore = () => {
    const rawProducts = data?.products;
    const hasMore = Array.isArray(rawProducts)
      ? rawProducts.length >= PER_PAGE * page
      : rawProducts?.hasNextPage ?? false;

    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMore({
        variables: { page: nextPage, perPage: PER_PAGE, categoryId: selectedCategoryId },
        updateQuery: (prev: ProductsQueryData, { fetchMoreResult }: { fetchMoreResult?: ProductsQueryData }) => {
          if (!fetchMoreResult?.products) return prev;
          // Guard: prev can be null if the cache entry was evicted or not yet populated
          if (!prev?.products) return fetchMoreResult;

          const prevList: Product[] = Array.isArray(prev.products)
            ? prev.products
            : (prev.products as any)?.nodes ?? [];
          const nextList: Product[] = Array.isArray(fetchMoreResult.products)
            ? fetchMoreResult.products
            : (fetchMoreResult.products as any)?.nodes ?? [];

          // Deduplicate by ID to avoid duplicate key warnings
          const existingIds = new Set(prevList.map((p) => p.id));
          const newItems = nextList.filter((p) => !existingIds.has(p.id));
          const merged = [...prevList, ...newItems];

          if (Array.isArray(prev.products)) {
            return { ...prev, products: merged };
          }
          return {
            ...prev,
            products: {
              ...(typeof fetchMoreResult.products === 'object' ? fetchMoreResult.products : {}),
              nodes: merged,
            },
          };
        },
      });
    }
  };

  const handleCategoryPress = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setPage(1);
  };

  if (loading && page === 1 && !refreshing) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message="Failed to load products." onRetry={() => refetch()} />;
  }

  const rawList: Product[] = Array.isArray(data?.products)
    ? data.products
    : (data?.products as any)?.nodes ?? [];

  // Deduplicate products defensively before rendering
  const seen = new Set<string>();
  const products: Product[] = rawList.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  const categories: Category[] = categoriesData?.categories ?? [];

  return (
    <View style={styles.container}>
      {/* Filters */}
      <FlatList
        horizontal
        data={[{ id: null, name: 'All' }, ...categories]}
        keyExtractor={(item, index) => `cat-${item.id ?? 'all'}-${index}`}
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        renderItem={({ item }) => (
          <Text
            style={[
              styles.chip,
              selectedCategoryId === item.id && styles.chipActive,
            ]}
            onPress={() => handleCategoryPress(item.id)}
          >
            {item.name}
          </Text>
        )}
      />

      {products.length === 0 ? (
        <EmptyState message="No products found." />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          initialNumToRender={10}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  chipsRow: { paddingHorizontal: 10, paddingVertical: 10, maxHeight: 50 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    fontSize: 13,
    color: '#555',
  },
  chipActive: { backgroundColor: '#2ecc71', color: '#fff', fontWeight: '600' },
});