import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Task {
  id: string;
  progress: number;
  title: string;
  status: string;
  description?: string; // Agrega esto si también quieres sanitizar la descripción
}

interface TaskProviderProps {
  children: ReactNode;
}

interface TaskContextProps {
  tasks: Task[];
  fetchTasksByProgress: (progressStatus: string) => void;
  loading: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskContextProps | undefined>(undefined);

const sanitizeText = (text: string) => {
  return text.replace(/['"]/g, ''); // Remueve comillas simples y dobles
};

export const TaskProviderProgress: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasksByProgress = useCallback(async (progressStatus: string) => {
    setLoading(true);
    setError(null);
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (jwtToken) {
        const response = await fetch(`https://api-gateway.zapto.org:5000/tasks-api/tasks/progress?progress_status=${progressStatus}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Sanitiza los datos recibidos
          const sanitizedTasks = data.map((task: Task) => ({
            ...task,
            title: sanitizeText(task.title),
            description: task.description ? sanitizeText(task.description) : undefined, // Sanitiza la descripción si existe
          }));
          setTasks(sanitizedTasks);
        } else {
          setError('Error al recuperar las tareas');
        }
      } else {
        setError('No se encontró el token de autenticación');
      }
    } catch (error) {
      console.error('Error al recuperar las tareas por estado de progreso', error);
      setError('Error al recuperar las tareas');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, fetchTasksByProgress, loading, error }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
