import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Category {
  taskCount: number;
  _id: string;
  name: string;
  user_id: string;
  color: string;
}

interface CategoryProviderProps {
  children: ReactNode;
}

const CategoryContext = createContext<{
  categories: Category[];
  fetchCategories: () => void;
} | undefined>(undefined);

export const CategoryProvider: React.FC<CategoryProviderProps> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  const sanitizeCategoryName = (name: string) => {
    return name.replace(/['"]/g, ''); // Remueve comillas simples y dobles
  };

  const fetchCategories = async () => {
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (jwtToken) {
        const response = await fetch('https://api-gateway.zapto.org:5000/categories-api/categories', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const categoriesData = data.map((category: any) => ({
            ...category,
            name: sanitizeCategoryName(category.name),
            color: getRandomColor(),
          }));
          setCategories(categoriesData);
        } else {
         /*  console.error('Error al obtener las categorías'); */
        }
      }
    } catch (error) {
      /* console.error('Error al recuperar las categorías', error); */
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

const getRandomColor = () => {
  const colors = ['#FF6F61', '#8E44AD', '#A3CB38', '#FF9FF3'];
  return colors[Math.floor(Math.random() * colors.length)];
};
