import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text } from 'react-native';
import { useLazyQuery } from '@apollo/client/react';
import { PRODUCTS_QUERY } from '../../api/graphql/products.graphql';
import ProductCard from '../../components/ProductCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { Product } from '../../types';

type SortOption = 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'NAME';

type ProductsQueryData = {
  products: Product[] | {
    nodes: Product[];
    totalCount?: number;
    hasNextPage?: boolean;
  };
};

export default function SearchScreen({ navigation }: any) {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>('NEWEST');

  const [runSearch, { data, loading, error }] = useLazyQuery<ProductsQueryData>(PRODUCTS_QUERY);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    runSearch({
      variables: {
        search: debouncedSearch || undefined,
        minimumPrice: minPrice ? parseFloat(minPrice) : undefined,
        maximumPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        inStockOnly: inStockOnly || undefined,
        sort,
        page: 1,
        perPage: 50,
      },
    });
  }, [debouncedSearch, minPrice, maxPrice, inStockOnly, sort, runSearch]);

  const products: Product[] = useMemo(() => {
    const raw: Product[] = Array.isArray(data?.products)
      ? data.products
      : (data?.products as any)?.nodes ?? [];

    let list = [...raw];

    // Text search filter
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Minimum price filter
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        list = list.filter((p) => (p.price ?? 0) >= min);
      }
    }

    // Maximum price filter
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        list = list.filter((p) => (p.price ?? 0) <= max);
      }
    }

    // In stock filter
    if (inStockOnly) {
      list = list.filter((p) => (p.stock ?? 0) > 0);
    }

    // Sorting options
    switch (sort) {
      case 'PRICE_ASC':
        list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'PRICE_DESC':
        list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'NAME':
        list.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
        break;
      case 'NEWEST':
      default:
        list.sort((a, b) =>
          String(b.id ?? '').localeCompare(String(a.id ?? ''), undefined, { numeric: true })
        );
        break;
    }

    return list;
  }, [data, debouncedSearch, minPrice, maxPrice, inStockOnly, sort]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <View style={styles.filterRow}>
        <TextInput
          style={styles.filterInput}
          placeholder="Min $"
          value={minPrice}
          onChangeText={setMinPrice}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Max $"
          value={maxPrice}
          onChangeText={setMaxPrice}
          keyboardType="numeric"
        />
        <Text
          style={[styles.stockToggle, inStockOnly && styles.stockToggleActive]}
          onPress={() => setInStockOnly(!inStockOnly)}
        >
          In Stock
        </Text>
      </View>

      <View style={styles.sortRow}>
        {(['NEWEST', 'PRICE_ASC', 'PRICE_DESC', 'NAME'] as SortOption[]).map((option) => (
          <Text
            key={option}
            style={[styles.sortChip, sort === option && styles.sortChipActive]}
            onPress={() => setSort(option)}
          >
            {option.replace('_', ' ')}
          </Text>
        ))}
      </View>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message="Search failed." onRetry={() => runSearch()} />
      ) : products.length === 0 ? (
        <EmptyState message="No products match your search." />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'center' },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
  },
  stockToggle: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    fontSize: 12,
  },
  stockToggleActive: { backgroundColor: '#2ecc71', color: '#fff' },
  sortRow: { flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    fontSize: 11,
  },
  sortChipActive: { backgroundColor: '#2ecc71', color: '#fff', fontWeight: '600' },
});