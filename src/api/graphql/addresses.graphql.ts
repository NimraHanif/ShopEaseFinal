import { gql } from '@apollo/client';

export {};

export const ADDRESS_FIELDS = gql`
  fragment AddressFields on Address {
    id
    label
    recipientName
    phoneNumber
    address
    city
    postalCode
    country
    default
  }
`;

export const ADDRESSES_QUERY = gql`
  ${ADDRESS_FIELDS}
  query Addresses {
    addresses {
      ...AddressFields
    }
  }
`;

export const CREATE_ADDRESS_MUTATION = gql`
  ${ADDRESS_FIELDS}
  mutation CreateAddress(
    $label: String
    $recipientName: String!
    $phoneNumber: String!
    $address: String!
    $city: String!
    $country: String!
    $postalCode: String
    $default: Boolean
  ) {
    createAddress(
      label: $label
      recipientName: $recipientName
      phoneNumber: $phoneNumber
      address: $address
      city: $city
      country: $country
      postalCode: $postalCode
      default: $default
    ) {
      address {
        ...AddressFields
      }
      errors
    }
  }
`;

export const UPDATE_ADDRESS_MUTATION = gql`
  ${ADDRESS_FIELDS}
  mutation UpdateAddress(
    $id: ID!
    $label: String
    $recipientName: String
    $phoneNumber: String
    $address: String
    $city: String
    $country: String
    $postalCode: String
    $default: Boolean
  ) {
    updateAddress(
      id: $id
      label: $label
      recipientName: $recipientName
      phoneNumber: $phoneNumber
      address: $address
      city: $city
      country: $country
      postalCode: $postalCode
      default: $default
    ) {
      address {
        ...AddressFields
      }
      errors
    }
  }
`;

export const DELETE_ADDRESS_MUTATION = gql`
  mutation DeleteAddress($id: ID!) {
    deleteAddress(id: $id) {
      success
      errors
    }
  }
`;

export const SET_DEFAULT_ADDRESS_MUTATION = gql`
  ${ADDRESS_FIELDS}
  mutation SetDefaultAddress($id: ID!) {
    setDefaultAddress(id: $id) {
      address {
        ...AddressFields
      }
      errors
    }
  }
`;