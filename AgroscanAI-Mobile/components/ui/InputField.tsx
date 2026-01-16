import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface InputFieldProps {
  label?: string;
  icon?: LucideIcon;
  rightIcon?: React.ReactNode; // Add this line
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
}

export default function InputField({ label, icon: Icon, rightIcon, ...props }: InputFieldProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        {Icon && <Icon size={18} color="#fbbf24" style={styles.icon} />}
        <TextInput 
          style={styles.input} 
          placeholderTextColor="#4b5563"
          {...props} 
        />
        {/* Render the eye button here if it exists */}
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 12 },
  label: { color: 'rgba(251, 191, 36, 0.6)', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 4, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    height: 56,
  },
  icon: { marginRight: 12 },
  input: { flex: 1, color: 'white', fontSize: 16 },
  rightIcon: { marginLeft: 10 } // Added spacing for the eye
});