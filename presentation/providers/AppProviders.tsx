// AppProviders.tsx
import React from 'react';
import { TaskProvider } from '@/presentation/providers/TaskProvider';
import { TaskProviderCategory } from '@/presentation/providers/TaskProviderCategory';
import { TaskProviderProgress } from '@/presentation/providers/TaskProviderProgress';
import { CategoryProvider } from '@/presentation/providers/CategoryProvider';
import { TaskDetailProvider } from '@/presentation/providers/TaskDetailProvider';
import { EditTaskProvider } from '@/presentation/providers/EditTaskProvider';
import { TaskSummaryProvider } from '@/presentation/providers/TaskSummaryProvider';

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <TaskProvider>
      <TaskProviderCategory>
        <TaskProviderProgress>
          <CategoryProvider>
            <TaskDetailProvider>
              <EditTaskProvider>
                <TaskSummaryProvider>
            {children}
                </TaskSummaryProvider>
              </EditTaskProvider>
            </TaskDetailProvider>
          </CategoryProvider>
        </TaskProviderProgress>
      </TaskProviderCategory>
    </TaskProvider>
  );
};

export default AppProviders;
