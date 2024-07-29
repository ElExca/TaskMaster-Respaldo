import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Subtask {
  title: string;
  completed: boolean;
}

interface TaskDetails {
  title: string;
  description: string;
  category: string;
  priority: string;
  start_reminder_date: string;
  due_date: string;
  due_time: string;
  start_reminder_time: string;
  end_reminder_time: string;
  subtasks: Subtask[];
  type: string;
  user_ids?: string[];
}

interface CreateTaskContextProps {
  createTask: (taskDetails: TaskDetails) => Promise<{ success: boolean; message: string }>;
  updateTask: (taskId: string, taskDetails: TaskDetails) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
  error: string | null;
}

interface CreateTaskProviderProps {
  children: ReactNode;
}

const CreateTaskContext = createContext<CreateTaskContextProps | undefined>(undefined);

export const CreateTaskProvider: React.FC<CreateTaskProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createTask = async (taskDetails: TaskDetails): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);

    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      const userId = await AsyncStorage.getItem('userId'); // Assuming you have stored userId in AsyncStorage

      if (jwtToken && userId) {
        const response = await fetch('https://api-gateway.zapto.org:5000/tasks-api/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...taskDetails,
            user_id: userId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.log('Create task failed with response:', data);
          throw new Error(data.error || 'Failed to create task');
        }

        return { success: true, message: 'Task created successfully' };
      } else {
        throw new Error('Authentication token or user ID not found');
      }
    } catch (error) {
      console.log('Create task error:', (error as Error).message);
      setError((error as Error).message);
      return { success: false, message: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId: string, taskDetails: TaskDetails): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);

    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');

      if (jwtToken) {
        const response = await fetch(`https://api-gateway.zapto.org:5000/tasks-api/edit/${taskId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskDetails),
        });

        const data = await response.json();

        if (!response.ok) {
          console.log('Update task failed with response:', data);
          throw new Error(data.error || 'Failed to update task');
        }

        return { success: true, message: 'Task updated successfully' };
      } else {
        throw new Error('Authentication token not found');
      }
    } catch (error) {
      console.log('Update task error:', (error as Error).message);
      setError((error as Error).message);
      return { success: false, message: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <CreateTaskContext.Provider value={{ createTask, updateTask, loading, error }}>
      {children}
    </CreateTaskContext.Provider>
  );
};

export const useCreateTask = () => {
  const context = useContext(CreateTaskContext);
  if (!context) {
    throw new Error('useCreateTask must be used within a CreateTaskProvider');
  }
  return context;
};
