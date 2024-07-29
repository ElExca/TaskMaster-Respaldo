import React from 'react';
import { TaskProvider } from '@/presentation/providers/TaskProvider';
import AllTasksScreen from '@/presentation/screens/AllTasksScreen';

const App = () => {
  return (
    <TaskProvider>
      <AllTasksScreen />
    </TaskProvider>
  );
};

export default App;
