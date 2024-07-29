import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import Header from '@/presentation/widgets/Header';
import { useTaskDetail } from '@/presentation/providers/TaskDetailProvider';

type TaskDetailScreenRouteProp = RouteProp<{ params: { taskId: string } }, 'params'>;

const TaskDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<TaskDetailScreenRouteProp>();
  const { taskId } = route.params;
  const { task, loading, error, fetchTaskDetails, updateSubtasks, deleteTask, setTask } = useTaskDetail();
  const [modalVisible, setModalVisible] = useState(false);
  const [subtaskLoading, setSubtaskLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchTaskDetails(taskId);
    }, [taskId])
  );

  const handleEditPress = () => {
    navigation.navigate('editTask', { taskId });
  };

  const handleDeletePress = () => {
    setModalVisible(true);
  };

  const confirmDelete = async () => {
    setModalVisible(false);
    try {
      await deleteTask(taskId);
      Alert.alert('Tarea eliminada', 'La tarea ha sido eliminada correctamente.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la tarea.');
    }
  };

  const handleSubtaskToggle = async (index: number) => {
    if (!task) return;
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[index].completed = !updatedSubtasks[index].completed;

    setSubtaskLoading(true);
    try {
      await updateSubtasks(taskId, updatedSubtasks);
      await fetchTaskDetails(taskId);  // Fetch task details again to update the state
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la subtarea.');
    } finally {
      setSubtaskLoading(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress <= 25) return '#F26158'; // Rojo
    if (progress <= 50) return '#F2A05D'; // Naranja
    if (progress <= 75) return '#F4EB70'; // Amarillo
    return '#A7D3A6';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2A9D8F" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No se pudieron cargar los detalles de la tarea.</Text>
      </View>
    );
  }

  const progressColor = getProgressColor(task.progress);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header />
      <Text style={styles.title}>{task.title}</Text>
      <View style={styles.progressContainer}>
        <Text style={styles.type}>{task.type.charAt(0).toUpperCase() + task.type.slice(1)}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${task.progress}%`, backgroundColor: progressColor }]} />
        </View>
        <Text style={styles.progressText}>{task.progress}% completado</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.description}>{task.description}</Text>
        <View style={styles.inlineRow}>
          <View style={styles.leftColumn}>
            <Text style={styles.labelBold}>Categoría:</Text>
            <Text style={styles.category}>{task.category}</Text>
          </View>
          <View style={styles.rightColumn}>
            <Text style={styles.labelBold}>Prioridad:</Text>
            <Text style={styles.priority}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Ionicons name="calendar" size={24} color="black" />
          <Text style={styles.labelBold}>Fecha de inicio de recordatorios:</Text>
        </View>
        <TextInput style={styles.input} value={task.start_reminder_date} editable={false} />
        <View style={styles.row}>
          <Ionicons name="time" size={24} color="black" />
          <Text style={styles.labelBold}>Horario de recordatorios:</Text>
        </View>
        <TextInput style={styles.input} value={`${task.start_reminder_time} - ${task.due_time}`} editable={false} />
        <View style={styles.row}>
          <Ionicons name="calendar" size={24} color="black" />
          <Text style={styles.labelBold}>Fecha límite:</Text>
        </View>
        <TextInput style={styles.input} value={task.due_date} editable={false} />
        <View style={styles.subtasksContainer}>
          <Text style={styles.subtasksTitle}>Subtareas</Text>
          {task.subtasks.map((subtask, index) => (
            <View key={index} style={styles.subtask}>
              <TouchableOpacity onPress={() => handleSubtaskToggle(index)}>
                {subtaskLoading ? (
                  <ActivityIndicator size="small" color="#2A9D8F" />
                ) : (
                  <Ionicons
                    name={subtask.completed ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={subtask.completed ? 'green' : 'grey'}
                  />
                )}
              </TouchableOpacity>
              <Text style={styles.subtaskTitle}>{subtask.title}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleDeletePress}>
          <Ionicons name="trash" size={24} color="black" />
          <Text style={styles.actionText}>Eliminar tarea</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleEditPress}>
          <Ionicons name="create" size={24} color="black" />
          <Text style={styles.actionText}>Editar tarea</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>¿Estás seguro de que deseas eliminar esta tarea?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={confirmDelete}>
                <Text style={styles.modalButtonText}>Sí</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A9D8F',
    marginVertical: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  type: {
    fontSize: 18,
    color: '#4A4A4A',
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginHorizontal: 8,
  },
  progress: {
    height: 10,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#4A4A4A',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 16,
  },
  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  labelBold: {
    fontSize: 14,
    color: '#4A4A4A',
    fontWeight: 'bold',
  },
  category: {
    fontSize: 14,
    color: '#4A4A4A',
  },
  priority: {
    fontSize: 14,
    color: '#4A4A4A',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#4A4A4A',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#F0F0F0',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  subtasksContainer: {
    marginBottom: 16,
  },
  subtasksTitle: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 8,
  },
  subtask: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtaskTitle: {
    fontSize: 14,
    color: '#4A4A4A',
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#4A4A4A',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: 300,
  },
  modalText: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#2A9D8F',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});

export default TaskDetailScreen;
