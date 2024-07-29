import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ParamListBase, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends ParamListBase {
      login: undefined;
      register: undefined;
      completedTasks: undefined;
      inProgressTasks: undefined;
      notStartedTasks: undefined;
      createtask: undefined;
      categoryTasks: { category: string };
      alltasks: undefined;
      taskDetail: undefined;
      Notifications: undefined;
      "(tabs)": undefined;
      "+not-found": undefined;
    }
  }
}
