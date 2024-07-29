import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/presentation/widgets/Header';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCreateTask } from '@/presentation/providers/CreateTaskProvider';
import { useCategories } from '@/presentation/providers/CategoryProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const CreateTaskScreen: React.FC = () => {
  const currentUser = 'Usuario Actual'; // Reemplaza esto con el nombre del usuario actual
  const { createTask, loading, error } = useCreateTask();
  const { categories, fetchCategories } = useCategories();
  const navigation = useNavigation();
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isNewCategoryModalVisible, setNewCategoryModalVisible] = useState(false);
  const [isMembersModalVisible, setMembersModalVisible] = useState(false);
  const [isAssigneesModalVisible, setAssigneesModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<{ user_id: string, username: string }[]>([{ user_id: currentUser, username: currentUser }]);
  const [selectedAssignees, setSelectedAssignees] = useState<{ user_id: string, username: string }[]>([]);
  const [taskDetails, setTaskDetails] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    limitTime: '',
    subtasks: [''],
    type: '',
  });
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [currentPickerField, setCurrentPickerField] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [categoryErrorMessage, setCategoryErrorMessage] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setTaskDetails({ ...taskDetails, [field]: value });
  };

  const addCategory = async () => {
    if (newCategory.trim()) {
      if (newCategory.length < 3 || newCategory.length > 25) {
        setCategoryErrorMessage('El nombre de la categoría debe tener entre 3 y 25 caracteres.');
        return;
      }

      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (jwtToken) {
        try {
          const response = await fetch('https://api-gateway.zapto.org:5000/categories-api/create', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${jwtToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newCategory }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al crear la categoría');
          }

          fetchCategories();
          setSelectedCategory(newCategory);
          setNewCategory('');
          setNewCategoryModalVisible(false);
          setCategoryModalVisible(false);
          setCategoryErrorMessage(null);
        } catch (error) {
          setCategoryErrorMessage((error as Error).message);
        }
      }
    } else {
      setCategoryErrorMessage('El nombre de la categoría no puede estar vacío.');
    }
  };

  const showPicker = (field: string, mode: 'date' | 'time') => {
    setCurrentPickerField(field);
    setPickerMode(mode);
    if (mode === 'date') {
      setDatePickerVisible(true);
    } else {
      setTimePickerVisible(true);
    }
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setDatePickerVisible(false);
    if (selectedDate) {
      const date = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
      handleInputChange(currentPickerField, date.toISOString().split('T')[0]);
    }
  };

  const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    setTimePickerVisible(false);
    if (selectedTime) {
      handleInputChange(currentPickerField, selectedTime.toTimeString().split(' ')[0].substring(0, 8));
    }
  };

  const fetchAllUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);

    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (jwtToken) {
        const response = await fetch('https://api-gateway.zapto.org:5000/users-api/usernames', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch users');
        }

        setAllUsers(data.users || []);
      }
    } catch (error) {
      setUsersError((error as Error).message);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (taskDetails.title.length < 3 || taskDetails.title.length > 50) {
      setErrorMessage('El título de la tarea debe tener entre 3 y 50 caracteres.');
      return;
    }

    if (taskDetails.description.length < 3 || taskDetails.description.length > 500) {
      setErrorMessage('La descripción de la tarea debe tener entre 3 y 500 caracteres.');
      return;
    }

    for (const subtask of taskDetails.subtasks) {
      if (subtask.length < 3 || subtask.length > 150) {
        setErrorMessage('Cada subtarea debe tener entre 3 y 150 caracteres.');
        return;
      }
    }

    const user_ids = taskDetails.type === 'Asignar' ? selectedAssignees.map(assignee => assignee.user_id) : selectedMembers.map(member => member.user_id);
    const newTaskDetails: any = {
      title: taskDetails.title,
      description: taskDetails.description,
      category: selectedCategory,
      priority: taskDetails.priority.toLowerCase(),
      start_reminder_date: taskDetails.startDate,
      due_date: taskDetails.endDate,
      due_time: taskDetails.limitTime,
      start_reminder_time: taskDetails.startTime,
      end_reminder_time: taskDetails.endTime,
      subtasks: taskDetails.subtasks.map(subtask => ({ title: subtask, completed: false })),
      type: taskDetails.type.toLowerCase(),
      user_ids,
    };

    console.log('Task JSON:', JSON.stringify(newTaskDetails, null, 2));

    try {
      const result = await createTask(newTaskDetails);
      if (result && result.success) {
        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          navigation.navigate('home'); // Reemplaza 'Home' con el nombre de tu pantalla principal
        }, 2000); // Espera 2 segundos antes de navegar
      } else {
        console.log('Create task error message:', result.message); // Log the error message from the backend
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.log('Create task error:', (error as Error).message);
      setErrorMessage('Error en la creación de la tarea.');
    }
  };

  const renderCategoryModal = () => (
    <Modal
      transparent={true}
      visible={isCategoryModalVisible}
      onRequestClose={() => setCategoryModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Selecciona una categoría</Text>
          <ScrollView style={styles.modalScrollView}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.name && styles.categoryButtonSelected,
                ]}
                onPress={() => {
                  setSelectedCategory(category.name);
                  setCategoryModalVisible(false);
                }}
              >
                <Text style={styles.categoryButtonText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={() => {
              setCategoryModalVisible(false);
              setNewCategoryModalVisible(true);
            }}
          >
            <Ionicons name="add" size={24} color="black" />
            <Text style={styles.addCategoryText}>Agregar categoría</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderNewCategoryModal = () => (
    <Modal
      transparent={true}
      visible={isNewCategoryModalVisible}
      onRequestClose={() => setNewCategoryModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Crear categoría</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Nombre de categoría"
            value={newCategory}
            onChangeText={setNewCategory}
          />
          {categoryErrorMessage && <Text style={styles.errorText}>{categoryErrorMessage}</Text>}
          <TouchableOpacity style={styles.modalButton} onPress={addCategory}>
            <Ionicons name="checkmark" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderSuccessModal = () => (
    <Modal
      transparent={true}
      visible={successModalVisible}
      onRequestClose={() => setSuccessModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>¡Tarea creada exitosamente!</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setSuccessModalVisible(false);
              navigation.navigate('home'); // Reemplaza 'Home' con el nombre de tu pantalla principal
            }}
          >
            <Ionicons name="checkmark" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderErrorModal = () => (
    <Modal
      transparent={true}
      visible={errorMessage !== null}
      onRequestClose={() => setErrorMessage(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Error</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setErrorMessage(null)}
          >
            <Ionicons name="checkmark" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderMembersModal = () => (
    <Modal
      transparent={true}
      visible={isMembersModalVisible}
      onRequestClose={() => setMembersModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Selecciona los integrantes</Text>
          {usersLoading ? (
            <ActivityIndicator size="large" color="#2A9D8F" />
          ) : usersError ? (
            <Text style={styles.errorText}>{usersError}</Text>
          ) : (
            allUsers.map((user, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.memberButton,
                  selectedMembers.some(member => member.user_id === user.user_id) && styles.memberButtonSelected,
                ]}
                onPress={() => {
                  if (selectedMembers.some(member => member.user_id === user.user_id)) {
                    setSelectedMembers(selectedMembers.filter(member => member.user_id !== user.user_id));
                  } else {
                    setSelectedMembers([...selectedMembers, { user_id: user.user_id, username: user.username }]);
                  }
                }}
              >
                <Text style={styles.memberButtonText}>{user.username}</Text>
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setMembersModalVisible(false)}
          >
            <Ionicons name="checkmark" size={24} color="white" />
            <Text style={styles.addCategoryText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderAssigneesModal = () => (
    <Modal
      transparent={true}
      visible={isAssigneesModalVisible}
      onRequestClose={() => setAssigneesModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Selecciona los asignados</Text>
          {usersLoading ? (
            <ActivityIndicator size="large" color="#2A9D8F" />
          ) : usersError ? (
            <Text style={styles.errorText}>{usersError}</Text>
          ) : (
            allUsers.map((user, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.memberButton,
                  selectedAssignees.some(assignee => assignee.user_id === user.user_id) && styles.memberButtonSelected,
                ]}
                onPress={() => {
                  if (selectedAssignees.some(assignee => assignee.user_id === user.user_id)) {
                    setSelectedAssignees(selectedAssignees.filter(assignee => assignee.user_id !== user.user_id));
                  } else {
                    setSelectedAssignees([...selectedAssignees, { user_id: user.user_id, username: user.username }]);
                  }
                }}
              >
                <Text style={styles.memberButtonText}>{user.username}</Text>
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setAssigneesModalVisible(false)}
          >
            <Ionicons name="checkmark" size={24} color="white" />
            <Text style={styles.addCategoryText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderCategoryModal()}
      {renderNewCategoryModal()}
      {renderSuccessModal()}
      {renderErrorModal()}
      {renderMembersModal()}
      {renderAssigneesModal()}
      <Header />
      <Text style={styles.title}>Crear nueva tarea</Text>
      <Text style={styles.label}>Título de la tarea</Text>
      <TextInput
        style={styles.input}
        placeholder="Título de tu tarea"
        onChangeText={(value) => handleInputChange('title', value)}
        value={taskDetails.title}
      />
      {taskDetails.title.length > 0 && (taskDetails.title.length < 3 || taskDetails.title.length > 50) && (
        <Text style={styles.errorText}>El título debe tener entre 3 y 50 caracteres.</Text>
      )}

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        onChangeText={(value) => handleInputChange('description', value)}
        value={taskDetails.description}
      />
      {taskDetails.description.length > 0 && (taskDetails.description.length < 3 || taskDetails.description.length > 500) && (
        <Text style={styles.errorText}>La descripción debe tener entre 3 y 500 caracteres.</Text>
      )}

    <Text style={styles.label}>Selecciona una categoría</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setCategoryModalVisible(true)}
      >
        
        <Text style={{ color: selectedCategory ? '#000' : '#AAA' }}>
          {selectedCategory || 'Selecciona una categoría'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Prioridad</Text>
      <View style={styles.priorityContainer}>
        {['Alta', 'Media', 'Baja'].map((priority) => (
          <TouchableOpacity
            key={priority}
            style={[
              styles.priorityButton,
              taskDetails.priority === priority && styles.priorityButtonSelected,
            ]}
            onPress={() => handleInputChange('priority', priority)}
          >
            <Text style={styles.priorityButtonText}>{priority}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Fecha de inicio de recordatorios</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => showPicker('startDate', 'date')}
      >
        <Text style={{ color: taskDetails.startDate ? '#000' : '#AAA' }}>
          {taskDetails.startDate || 'Fecha de inicio de recordatorios'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Hora de inicio de recordatorio</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => showPicker('startTime', 'time')}
      >
        <Text style={{ color: taskDetails.startTime ? '#000' : '#AAA' }}>
          {taskDetails.startTime || 'Inicio de recordatorios'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.label}>Hora de final de recordatorio</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => showPicker('endTime', 'time')}
      >
        <Text style={{ color: taskDetails.endTime ? '#000' : '#AAA' }}>
          {taskDetails.endTime || 'Fin de recordatorios'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.label}>Fecha límite para completar</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => showPicker('endDate', 'date')}
      >
        <Text style={{ color: taskDetails.endDate ? '#000' : '#AAA' }}>
          {taskDetails.endDate || 'Fecha límite'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.label}>Hora límite para completar</Text>

      <TouchableOpacity
        style={styles.input}
        onPress={() => showPicker('limitTime', 'time')}
      >
        <Text style={{ color: taskDetails.limitTime ? '#000' : '#AAA' }}>
          {taskDetails.limitTime || 'Hora límite'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Subtareas</Text>
      {taskDetails.subtasks.map((subtask, index) => (
        <View key={index} style={styles.subtaskContainer}>
          <TextInput
            style={styles.subtaskInput}
            placeholder={`Subtarea ${index + 1}`}
            value={subtask}
            onChangeText={(value) => {
              const newSubtasks = [...taskDetails.subtasks];
              newSubtasks[index] = value;
              handleInputChange('subtasks', newSubtasks);
            }}
          />
          <TouchableOpacity onPress={() => {
            const newSubtasks = taskDetails.subtasks.filter((_, i) => i !== index);
            handleInputChange('subtasks', newSubtasks);
          }}>
            <Ionicons name="trash" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ))}
      {taskDetails.subtasks.some(subtask => subtask.length < 3 || subtask.length > 150) && (
        <Text style={styles.errorText}>Cada subtarea debe tener entre 3 y 150 caracteres.</Text>
      )}
      <TouchableOpacity onPress={() => handleInputChange('subtasks', [...taskDetails.subtasks, ''])}>
        <Ionicons name="add" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.typeContainer}>
        {['Individual', 'Grupal', 'Asignar'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              taskDetails.type === type && styles.typeButtonSelected,
            ]}
            onPress={() => {
              handleInputChange('type', type);
              if (type === 'Grupal') {
                setSelectedMembers([{ user_id: currentUser, username: currentUser }]);
                fetchAllUsers(); // Fetch users when "Grupal" is selected
              } else if (type === 'Asignar') {
                setSelectedMembers([]);
                fetchAllUsers(); // Fetch users when "Asignar" is selected
              } else {
                setSelectedMembers([]);
              }
            }}
          >
            <Text style={styles.typeButtonText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {taskDetails.type === 'Grupal' && (
        <TouchableOpacity
          style={styles.input}
          onPress={() => setMembersModalVisible(true)}
        >
          <Text style={{ color: '#000' }}>Seleccionar integrantes</Text>
        </TouchableOpacity>
      )}

      {taskDetails.type === 'Asignar' && (
        <TouchableOpacity
          style={styles.input}
          onPress={() => setAssigneesModalVisible(true)}
        >
          <Text style={{ color: '#000' }}>Seleccionar asignados</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.label}>Integrantes</Text>
      <View style={styles.selectedItemsContainer}>
        {(taskDetails.type === 'Grupal' ? selectedMembers : selectedAssignees).map((user, index) => (
          <View key={index} style={styles.selectedItem}>
            <Text style={styles.selectedItemText}>{user.username}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleCreateTask} disabled={loading}>
        <Text style={styles.submitButtonText}>Crear Tarea</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#2A9D8F" />}
     {/*  {error && <Text style={styles.errorText}>{error}</Text>} */}

      {datePickerVisible && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      {timePickerVisible && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F8F8F8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A9D8F',
    marginVertical: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priorityButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#EEE',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  priorityButtonSelected: {
    backgroundColor: '#2A9D8F',
  },
  priorityButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  subtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtaskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#EEE',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  typeButtonSelected: {
    backgroundColor: '#2A9D8F',
  },
  typeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#2A9D8F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modalScrollView: {
    maxHeight: 300,
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#2A9D8F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  categoryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#EEE',
    marginVertical: 4,
    width: '100%',
    alignItems: 'center',
  },
  categoryButtonSelected: {
    backgroundColor: '#2A9D8F',
  },
  categoryButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  addCategoryText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  selectedItem: {
    backgroundColor: '#EEE',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedItemText: {
    color: '#000',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 16,
  },
  memberButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#EEE',
    marginVertical: 4,
    width: '100%',
    alignItems: 'center',
  },
  memberButtonSelected: {
    backgroundColor: '#2A9D8F',
  },
  memberButtonText: {
    color: '#000',
  },
});

export default CreateTaskScreen;
