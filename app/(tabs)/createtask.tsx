import React from 'react';
import CreateTaskScreen from '@/presentation/screens/CreateTaskScreen';
import { CreateTaskProvider } from '@/presentation/providers/CreateTaskProvider';

const CreateTask: React.FC = () => {
  return (
    <CreateTaskProvider>
      <CreateTaskScreen />
    </CreateTaskProvider>
  );
};

export default CreateTask;

