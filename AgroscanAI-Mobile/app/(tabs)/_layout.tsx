import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { IconGrid, IconMicroscope } from '../../components/ui/Icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981', 
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#0a0f1a',
          borderTopWidth: 0, 
          height: 75,        
          paddingBottom: 15, 
          paddingTop: 10,
          position: 'absolute',
          bottom: 25, // Lifted slightly more for better clearance      
          left: 20,          
          right: 20,         
          borderRadius: 25,  
          borderWidth: 1,
          borderColor: '#1e293b',
          elevation: 9,      
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => <IconGrid color={color} size={22} />,
        }}
      />

      <Tabs.Screen
        name="two"
        options={{
          title: 'AI Analysis',
          tabBarIcon: ({ color }) => <IconMicroscope color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}