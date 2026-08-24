import React from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { SUPPORT_ARTICLES_QUERY } from '../../api/graphql/support.graphql';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { SupportArticle } from '../../types';

type SupportArticlesQueryData = {
  supportArticles: SupportArticle[];
};

// Help & Support
export default function HelpSupportScreen({ navigation }: any) {
  const { data, loading, error, refetch } = useQuery<SupportArticlesQueryData>(SUPPORT_ARTICLES_QUERY);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load articles." onRetry={() => refetch()} />;

  const articles = data?.supportArticles ?? [];

  return (
    <View style={styles.container}>
      {articles.length === 0 ? (
        <EmptyState message="No help articles available right now." />
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => (
            <View style={styles.article}>
              <Text style={styles.articleTitle}>{item.title}</Text>
              <Text style={styles.articleContent} numberOfLines={3}>{item.content}</Text>
            </View>
          )}
        />
      )}

      <View style={styles.footer}>
        <Button title="Contact Support" onPress={() => navigation.navigate('SupportRequest')} color="#2ecc71" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  article: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  articleTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  articleContent: { fontSize: 13, color: '#666' },
  footer: { padding: 16 },
});