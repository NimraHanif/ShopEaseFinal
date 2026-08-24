import { gql } from '@apollo/client';
import { USER_FIELDS } from './auth.graphql';

//  Update Profile
export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($name: String) {
    updateProfile(name: $name) {
      user {
        id
        name
        email
      }
      errors
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($currentPassword: String!, $password: String!, $passwordConfirmation: String!) {
    changePassword(currentPassword: $currentPassword, password: $password, passwordConfirmation: $passwordConfirmation) {
      user {
        id
        name
        email
      }
      errors
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      errors
    }
  }
`;