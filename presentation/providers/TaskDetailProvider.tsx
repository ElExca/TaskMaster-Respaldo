import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Task {
  title: string;
  description: string;
  category: string;
  priority: string;
  type: string;
  progress: number;
  start_reminder_date: string;
  start_reminder_time: string;
  end_reminder_time: string;
  due_date: string;
  due_time: string;
  subtasks: { title: string; completed: boolean }[];
}

interface TaskDetailContextProps {
  task: Task | null;
  loading: boolean;
  error: string | null;
  fetchTaskDetails: (taskId: string) => void;
  updateSubtasks: (taskId: string, subtasks: { title: string; completed: boolean }[]) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  setTask: React.Dispatch<React.SetStateAction<Task | null>>;
}

const TaskDetailContext = createContext<TaskDetailContextProps | undefined>(undefined);

interface TaskDetailProviderProps {
  children: ReactNode;
}

const sanitizeText = (text: string) => {
  return text.replace(/['"]/g, ''); // Remueve comillas simples y dobles
};

export const TaskDetailProvider: React.FC<TaskDetailProviderProps> = ({ children }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskDetails = async (taskId: string) => {
    setLoading(true);
    setError(null);

    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`https://api-gateway.zapto.org:5000/tasks-api/task/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch task details');
      }

      // Decodificar caracteres de escape Unicode
      const decodedData = JSON.parse(JSON.stringify(data), (key, value) =>
        typeof value === 'string' ? value.replace(/\\u[\dA-F]{4}/gi, match => {
          return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
        }) : value
      );

      // Sanitiza los campos relevantes
      const sanitizedTask = {
        ...decodedData,
        title: sanitizeText(decodedData.title),
        description: sanitizeText(decodedData.description),
        subtasks: decodedData.subtasks.map((subtask: { title: string; completed: boolean }) => ({
          ...subtask,
          title: sanitizeText(subtask.title),
        })),
      };

      setTask(sanitizedTask);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const updateSubtasks = async (taskId: string, subtasks: { title: string; completed: boolean }[]) => {
    setLoading(true);
    setError(null);

    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`https://api-gateway.zapto.org:5000/tasks-api/task/${taskId}/subtasks`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subtasks }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update subtasks');
      }

      // Update the task details after updating the subtasks
      await fetchTaskDetails(taskId);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setLoading(true);
    setError(null);

    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`https://api-gateway.zapto.org:5000/tasks-api/task/delete/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete task');
      }

      setTask(null);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TaskDetailContext.Provider value={{ task, loading, error, fetchTaskDetails, updateSubtasks, deleteTask, setTask }}>
      {children}
    </TaskDetailContext.Provider>
  );
};

export const useTaskDetail = () => {
  const context = useContext(TaskDetailContext);
  if (context === undefined) {
    throw new Error('useTaskDetail must be used within a TaskDetailProvider');
  }
  return context;
};
