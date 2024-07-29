import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, BackHandler, Alert } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTasks as useTasksProgress } from '@/presentation/providers/TaskProviderProgress';
import { useCategories } from '@/presentation/providers/CategoryProvider';
import { useTaskSummary } from '@/presentation/providers/TaskSummaryProvider';
import Header from '@/presentation/widgets/Header';
import ProgressBar from '@/presentation/widgets/ProgressBar';
import CategoryButton from '@/presentation/widgets/CategoryButton';
import PerformanceChart from '@/presentation/widgets/PerformanceChart';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

type RootStackParamList = {
  login: undefined;
  register: undefined;
  completedTasks: undefined;
  inProgressTasks: undefined;
  notStartedTasks: undefined;
  createtask: undefined;
  categoryTasks: { category: string };
  alltasks: undefined;
  home: undefined;
  "(tabs)": undefined;
  "+not-found": undefined;
  taskDetail: undefined;
};

const HomeScreen: React.FC = () => {
  const { tasks, loading: tasksLoading, fetchTasksByProgress } = useTasksProgress();
  const { categories, fetchCategories } = useCategories();
  const { taskSummary, loading: summaryLoading, error, fetchTaskSummary } = useTaskSummary();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const [username, setUsername] = useState<string | null>(null);

  const getUsername = async () => {
    const storedUsername = await AsyncStorage.getItem('username');
    if (storedUsername) {
      setUsername(capitalizeWords(storedUsername));
    }
  };

  useEffect(() => {
    getUsername();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Previene salir de la pantalla de inicio con el botón de retroceso
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      // Cleanup event listener on screen unmount
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      opacity.value = withTiming(1, { duration: 500 });
      translateY.value = withTiming(0, { duration: 500 });
      fetchCategories();
      fetchTasksByProgress('all'); // Assumes you have a way to fetch all tasks
      fetchTaskSummary();
    }, [opacity, translateY])
  );

  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const noTasksColor = '#E0E0E0';

  if (tasksLoading || summaryLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2A9D8F" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const handleCategoryPress = (category: string) => {
    navigation.navigate('categoryTasks', { category });
  };

  const handleCreateTaskPress = () => {
    navigation.navigate('createtask');
  };

  const handleViewCompletedTasksPress = () => {
    navigation.navigate('completedTasks');
  };

  const handleViewInProgressTasksPress = () => {
    navigation.navigate('inProgressTasks');
  };

  const handleViewNotStartedTasksPress = () => {
    navigation.navigate('notStartedTasks');
  };

  const getProgressColor = (totalTasks: number, color: string) => {
    return totalTasks > 0 ? color : noTasksColor;
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView>
        <Animated.View style={[styles.welcomeContainer, animatedStyle]}>
          <Text style={styles.greeting}>Hola, de nuevo</Text>
          <Text style={styles.username}>{username}</Text>
        </Animated.View>
        <Animated.View style={[styles.newTaskButtonContainer, animatedStyle]}>
          <TouchableOpacity style={styles.newTaskButton} onPress={handleCreateTaskPress}>
            <Text style={styles.newTaskButtonText}>Crear nueva tarea</Text>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.section, animatedStyle]}>
          <Text style={styles.sectionTitle}>Felicidades!!!</Text>
          <ProgressBar 
            progress={((taskSummary?.total_completada ?? 0) / (taskSummary?.total_tasks ?? 1)) * 100} 
            color={getProgressColor(taskSummary?.total_tasks ?? 0, "#A7D3A6")} 
          />
          <TouchableOpacity onPress={handleViewCompletedTasksPress}>
            <Text style={styles.sectionSubtitle}>Ver tareas completadas</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.section, animatedStyle]}>
          <Text style={styles.sectionTitle}>Te falta poco</Text>
          <ProgressBar 
            progress={((taskSummary?.total_en_progreso ?? 0) / (taskSummary?.total_tasks ?? 1)) * 100} 
            color={getProgressColor(taskSummary?.total_tasks ?? 0, "#F4EB70")} 
          />
          <TouchableOpacity onPress={handleViewInProgressTasksPress}>
            <Text style={styles.sectionSubtitle}>Ver tareas en proceso</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.section, animatedStyle]}>
          <Text style={styles.sectionTitle}>No te olvides!</Text>
          <ProgressBar 
            progress={((taskSummary?.total_sin_iniciar ?? 0) / (taskSummary?.total_tasks ?? 1)) * 100} 
            color={getProgressColor(taskSummary?.total_tasks ?? 0, "#F26158")} 
          />
          <TouchableOpacity onPress={handleViewNotStartedTasksPress}>
            <Text style={styles.sectionSubtitle}>Ver tareas sin iniciar</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.section, animatedStyle]}>
          <Text style={styles.sectionTitle}>Ver tareas de:</Text>
          <View style={styles.categoryContainer}>
            {taskSummary?.categories.map((item) => (
              <CategoryButton
                key={item.category}
                category={item.category}
                taskCount={item.total_tasks}
                onPress={() => handleCategoryPress(item.category)}
              />
            ))}
          </View>
        </Animated.View>
        <Animated.View style={[styles.section, animatedStyle]}>
          <PerformanceChart
            completed={taskSummary?.total_completada || 0}
            inProgress={taskSummary?.total_en_progreso || 0}
            notStarted={taskSummary?.total_sin_iniciar || 0}
            totalTasks={taskSummary?.total_tasks || 0}
            completionRate={taskSummary?.predicted_completion_rate || 0}
            trend={taskSummary?.trend || 'neutral'}
          />
          <TouchableOpacity onPress={() => navigation.navigate('alltasks')}>
            <Text style={styles.viewAllTasksText}>Ver todas mis tareas</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
  welcomeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  greeting: {
    fontSize: 24,
    color: '#4A4A4A',
  },
  username: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2A9D8F',
  },
  newTaskButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  newTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2A9D8F',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  newTaskButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#9E9E9E',
    marginTop: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  viewAllTasksText: {
    color: '#2A9D8F',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2A9D8F',
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
