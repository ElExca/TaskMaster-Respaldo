import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Category {
  category: string;
  total_tasks: number;
}

interface TaskSummary {
  categories: Category[];
  predicted_completion_rate: number;
  total_completada: number;
  total_en_progreso: number;
  total_sin_iniciar: number;
  total_tasks: number;
  trend: string;
}

interface TaskSummaryContextProps {
  taskSummary: TaskSummary | null;
  loading: boolean;
  error: string | null;
  fetchTaskSummary: () => void;
}

const TaskSummaryContext = createContext<TaskSummaryContextProps | undefined>(undefined);

export const TaskSummaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [taskSummary, setTaskSummary] = useState<TaskSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      const response = await fetch('https://api-gateway.zapto.org:5000/tasks-api/categories/summary', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch task summary');
      }
      setTaskSummary(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskSummary();
  }, []);

  return (
    <TaskSummaryContext.Provider value={{ taskSummary, loading, error, fetchTaskSummary }}>
      {children}
    </TaskSummaryContext.Provider>
  );
};

export const useTaskSummary = () => {
  const context = useContext(TaskSummaryContext);
  if (context === undefined) {
    throw new Error('useTaskSummary must be used within a TaskSummaryProvider');
  }
  return context;
};
