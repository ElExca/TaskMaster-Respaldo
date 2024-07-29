import React, { useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useTasks } from '@/presentation/providers/TaskProviderProgress';
import TaskItem from '@/presentation/widgets/TaskItem';
import Header from '@/presentation/widgets/Header';

type RootStackParamList = {
  taskDetail: { taskId: string };
};

const CompletedTasksScreen: React.FC = () => {
  const { tasks, fetchTasksByProgress, loading, error } = useTasks();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      fetchTasksByProgress('completada');
    }, [fetchTasksByProgress])
  );

  const handleTaskPress = (taskId: string) => {
    navigation.navigate('taskDetail', { taskId });
  };

  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.title}>Tareas Completadas</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2A9D8F" />
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
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
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default CompletedTasksScreen;
