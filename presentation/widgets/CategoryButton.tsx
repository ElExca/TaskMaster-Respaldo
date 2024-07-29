import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

// Lista de colores
const colors = ['#BAD7F2', '#BADEF0' , '#BAE5EE' , '#B0F2B4' , '#EE7DB2' , '#F4EB70' , '#B5F2CF' , '#FF9770' , '#FF848B' , '#FF7A99' , '#FF70A6' , '#DC8ABD' , '#B8A3D3' , '#94BDE9' , '#70D6FF' , '#F2CEC2' , '#F2D8BE' , '#F2CEC2' ];

interface CategoryButtonProps {
  category: string;
  taskCount: number;
  onPress: () => void;
}

// Función para obtener un color aleatorio de la lista
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

const CategoryButton: React.FC<CategoryButtonProps> = ({ category, taskCount, onPress }) => {
  const opacity = useSharedValue(0);
  const color = getRandomColor(); // Obtener color aleatorio

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, { backgroundColor: color }, animatedStyle]}>
      <TouchableOpacity onPress={onPress} style={styles.button}>
        <Text style={styles.categoryText}>{category}</Text>
        <Text style={styles.taskCountText}>{taskCount} tareas</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexBasis: '48%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  taskCountText: {
    fontSize: 14,
    color: '#fff',
  },
});

export default CategoryButton;
