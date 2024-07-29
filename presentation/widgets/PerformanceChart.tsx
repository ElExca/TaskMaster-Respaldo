import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, G, Text as SvgText, TSpan } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

interface PerformanceChartProps {
  completed: number;
  inProgress: number;
  notStarted: number;
  totalTasks: number;
  completionRate: number;
  trend: string;
}

const screenWidth = Dimensions.get('window').width;
const radius = 70;
const circumference = 2 * Math.PI * radius;

const PerformanceChart: React.FC<PerformanceChartProps> = ({ completed, inProgress, notStarted, totalTasks, completionRate, trend }) => {
  const completedPercentage = (completed / totalTasks) * 100;
  const inProgressPercentage = (inProgress / totalTasks) * 100;
  const notStartedPercentage = (notStarted / totalTasks) * 100;

  const noTasksColor = '#E0E0E0';

  return (
    <View style={styles.container}>
      <View style={styles.performanceHeader}>
        <Text style={styles.title}>¿Cómo va tu desempeño?</Text>
        <View style={styles.completionRateContainer}>
          <Ionicons
            name={trend === "positive" ? "trending-up" : "trending-down"}
            size={28}
            color={trend === "positive" ? "green" : "red"}
          />
          <Text style={styles.completionRateText}>{(completionRate).toFixed(1)}%</Text>
        </View>
      </View>
      <Svg width={screenWidth - 32} height={200} viewBox="0 0 200 200">
        <G rotation="-90" origin="100, 100">
          <Circle
            cx="100"
            cy="100"
            r={radius}
            stroke={totalTasks > 0 ? "#A7D3A6" : noTasksColor}
            strokeWidth="30"
            strokeDasharray={`${(circumference * completedPercentage) / 100}, ${circumference}`}
            fill="none"
          />
          <Circle
            cx="100"
            cy="100"
            r={radius}
            stroke={totalTasks > 0 ? "#F4EB70" : noTasksColor}
            strokeWidth="30"
            strokeDasharray={`${(circumference * inProgressPercentage) / 100}, ${circumference}`}
            fill="none"
            strokeDashoffset={-(circumference * completedPercentage) / 100}
          />
          <Circle
            cx="100"
            cy="100"
            r={radius}
            stroke={totalTasks > 0 ? "#F26158" : noTasksColor}
            strokeWidth="30"
            strokeDasharray={`${(circumference * notStartedPercentage) / 100}, ${circumference}`}
            fill="none"
            strokeDashoffset={-((circumference * (completedPercentage + inProgressPercentage)) / 100)}
          />
        </G>
        <SvgText
          x="100"
          y="70"
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize="20"
          fill="#000"
          fontWeight="500"
        >
          <TSpan x="100" dy="1.2em">Tus tareas</TSpan>
        </SvgText>

        <SvgText
          x="100"
          y="93"
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize="20"
          fill="#000"
          fontWeight="bold"
        >
          <TSpan x="100" dy="1.2em">{totalTasks}</TSpan>
        </SvgText>
      </Svg>
      <View style={styles.statsContainer}>
        <View style={[styles.statsBox, { backgroundColor: totalTasks > 0 ? '#A7D3A6' : noTasksColor }]}>
          <Text style={styles.statsText}> Tareas completadas {completed}</Text>
        </View>
        <View style={[styles.statsBox, { backgroundColor: totalTasks > 0 ? '#F4EB70' : noTasksColor }]}>
        <Text style={styles.statsText}>
          Tareas en proceso{'\n'}
          {inProgress}
        </Text>
      </View>
        <View style={[styles.statsBox, { backgroundColor: totalTasks > 0 ? '#F26158' : noTasksColor }]}>
          <Text style={styles.statsText}> Tareas sin iniciar{'\n'}{notStarted}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
  completionRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 25,
    left: 16,
  },
  completionRateText: {
    fontSize: 14,
    marginLeft: 4,
    color: '#4A4A4A',
  },
  totalTasks: {
    position: 'absolute',
    top: 85,
    left: (screenWidth - 32) / 2 - 50,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  statsBox: {
    flex: 1,
    marginHorizontal: 4,
    padding: 8,
    borderRadius: 8,
  },
  statsText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
});

export default PerformanceChart;
