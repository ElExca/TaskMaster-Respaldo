import React, { useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useTasksCategory } from '@/presentation/providers/TaskProviderCategory';
import TaskItem from '@/presentation/widgets/TaskItem';
import Header from '@/presentation/widgets/Header';

type RootStackParamList = {
  taskDetail: { taskId: string };
};

const CategoryTasksScreen: React.FC = () => {
  const route = useRoute();
  const { category } = route.params as { category: string };
  const { tasks, fetchTasksByCategory, loading } = useTasksCategory();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      console.log(`Fetching tasks for category: ${category}`);
      fetchTasksByCategory(category);
    }, [category])
  );

  const handleTaskPress = (taskId: string) => {
    navigation.navigate('taskDetail', { taskId });
  };

  useEffect(() => {
    console.log('Tasks:', tasks); 
  }, [tasks]);

  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.title}>Tareas de {category}</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2A9D8F" />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem task={item} onPress={() => handleTaskPress(item.id)} />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CategoryTasksScreen;
