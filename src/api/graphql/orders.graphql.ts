import { gql } from '@apollo/client';
import { ADDRESS_FIELDS } from './addresses.graphql';

export const ORDER_ITEM_FIELDS = gql`
  fragment OrderItemFields on OrderItem {
    id
    price
    quantity
    product {
      id
      name
      photoUrl
    }
  }
`;

export const ORDER_FIELDS = gql`
  ${ORDER_ITEM_FIELDS}
  ${ADDRESS_FIELDS}
  fragment OrderFields on Order {
    id
    orderNumber
    status
    subtotal
    totalPrice
    createdAt
    deliveryAddressSnapshot
    address {
      ...AddressFields
    }
    orderItems {
      ...OrderItemFields
    }
  }
`;

// Orders Query
export const ORDERS_QUERY = gql`
  query Orders($status: String, $page: Int, $perPage: Int) {
    orders(status: $status, page: $page, perPage: $perPage) {
      id
      orderNumber
      status
      subtotal
      totalPrice
      createdAt
    }
  }
`;

// Order Query
export const ORDER_QUERY = gql`
  ${ORDER_ITEM_FIELDS}
  ${ADDRESS_FIELDS}
  query Order($id: ID!) {
    order(id: $id) {
      id
      orderNumber
      status
      subtotal
      totalPrice
      createdAt
      deliveryAddressSnapshot
      address {
        ...AddressFields
      }
      orderItems {
        ...OrderItemFields
      }
    }
  }
`;

// Create Order
export const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($addressId: ID!, $items: [OrderItemInput!]!) {
    createOrder(addressId: $addressId, items: $items) {
      order {
        id
        orderNumber
        status
        subtotal
        totalPrice
      }
      errors
    }
  }
`;