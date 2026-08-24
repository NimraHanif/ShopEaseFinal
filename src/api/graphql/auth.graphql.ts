import { gql } from '@apollo/client';

export const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    name
    email
    status
    avatarUrl
  }
`;

export const ME_QUERY = gql`
  ${USER_FIELDS}
  query Me {
    me {
      ...UserFields
    }
  }
`;

export const SIGN_UP_MUTATION = gql`
  mutation SignUp($name: String!, $email: String!, $password: String!, $passwordConfirmation: String!) {
    signUp(name: $name, email: $email, password: $password, passwordConfirmation: $passwordConfirmation) {
      token
      user {
        id
        name
        email
      }
      errors
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
      errors
    }
  }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      success
      message
      errors
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($email: String!, $token: String!, $password: String!, $passwordConfirmation: String!) {
    resetPassword(email: $email, token: $token, password: $password, passwordConfirmation: $passwordConfirmation) {
      user {
        id
        email
      }
      errors
    }
  }
`;