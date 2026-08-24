import { gql } from '@apollo/client';

export const CATEGORY_FIELDS = gql`
  fragment CategoryFields on Category {
    id
    name
    slug
  }
`;

export const PRODUCT_FIELDS = gql`
  ${CATEGORY_FIELDS}
  fragment ProductFields on Product {
    id
    name
    description
    price
    stock
    active
    photoUrl
    category {
      ...CategoryFields
    }
  }
`;

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      id
      name
      slug
      description
    }
  }
`;

// Filters
export const PRODUCTS_QUERY = gql`
  query Products(
    $search: String
    $categoryId: ID
    $minimumPrice: Float
    $maximumPrice: Float
    $inStockOnly: Boolean
    $page: Int
    $perPage: Int
    $sort: String
  ) {
    products(
      search: $search
      categoryId: $categoryId
      minimumPrice: $minimumPrice
      maximumPrice: $maximumPrice
      inStockOnly: $inStockOnly
      page: $page
      perPage: $perPage
      sort: $sort
    ) {
      id
      name
      price
      stock
      description
      photoUrl
      category {
        id
        name
        slug
      }
    }
  }
`;

export const PRODUCT_QUERY = gql`
  query Product($id: ID!) {
    product(id: $id) {
      id
      name
      price
      stock
      description
      photoUrl
      category {
        id
        name
      }
    }
  }
`;

export const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($name: String!, $description: String, $price: Float!, $stock: Int!, $categoryId: ID!, $active: Boolean) {
    createProduct(name: $name, description: $description, price: $price, stock: $stock, categoryId: $categoryId, active: $active) {
      product {
        id
        name
        price
        stock
      }
      errors
    }
  }
`;

export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory($name: String!, $slug: String!) {
    createCategory(name: $name, slug: $slug) {
      category {
        id
        name
        slug
      }
      errors
    }
  }
`;