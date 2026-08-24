import { gql } from '@apollo/client';

export const SUPPORT_ARTICLE_FIELDS = gql`
  fragment SupportArticleFields on SupportArticle {
    id
    title
    content
    position
  }
`;

// Support Articles
export const SUPPORT_ARTICLES_QUERY = gql`
  query SupportArticles($active: Boolean) {
    supportArticles(active: $active) {
      id
      title
      content
    }
  }
`;

//Create Support Request
export const CREATE_SUPPORT_REQUEST_MUTATION = gql`
  mutation CreateSupportRequest($subject: String!, $message: String!) {
    createSupportRequest(subject: $subject, message: $message) {
      supportRequest {
        id
        subject
      }
      errors
    }
  }
`;