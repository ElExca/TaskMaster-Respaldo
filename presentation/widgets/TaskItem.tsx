import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Task {
  id: string;
  progress: number;
  title: string;
}

interface TaskItemProps {
  task: Task;
  onPress: () => void;
}

const decodeUnicode = (str: string) => {
  return decodeURIComponent(JSON.parse('"' + str.replace(/\"/g, '\\"') + '"'));
};

const getProgressColor = (progress: number) => {
  if (progress <= 25) return '#F26158'; // Rojo
  if (progress <= 50) return '#F2A05D'; // Naranja
  if (progress <= 75) return '#F4EB70'; // Amarillo
  return '#A7D3A6'; // Verde
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onPress }) => {
  const decodedTitle = decodeUnicode(task.title);
  const progressColor = getProgressColor(task.progress);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Text style={styles.title}>{decodedTitle}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${task.progress}%`, backgroundColor: progressColor }]} />
      </View>
      <Text style={styles.progressText}>{task.progress}% completado</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginVertical: 8,
  },
  progress: {
    height: 10,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#4A4A4A',
  },
});

export default TaskItem;
