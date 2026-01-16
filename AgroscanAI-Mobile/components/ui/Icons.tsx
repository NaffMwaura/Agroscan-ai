import React from 'react';
import { 
  Leaf, LogOut, LayoutGrid, Upload, Microscope, 
  CheckCircle, Mail, MapPin, User, ChevronDown, 
  MessageSquare, Star, ShieldCheck, Zap, Camera,
  Image, Trash2 // Added these
} from 'lucide-react-native';

interface IconProps {
  size?: number;
  color?: string;
}

export const IconLeaf = ({ size = 24, color = "#f59e0b" }: IconProps) => <Leaf size={size} color={color} />;
export const IconLogOut = ({ size = 24, color = "white" }: IconProps) => <LogOut size={size} color={color} />;
export const IconGrid = ({ size = 24, color = "white" }: IconProps) => <LayoutGrid size={size} color={color} />;
export const IconUploadInternal = ({ size = 24, color = "#22d3ee" }: IconProps) => <Upload size={size} color={color} />;
export const IconMicroscope = ({ size = 24, color = "#22d3ee" }: IconProps) => <Microscope size={size} color={color} />;
export const IconCheckCircleInternal = ({ size = 24, color = "#4ade80" }: IconProps) => <CheckCircle size={size} color={color} />;
export const IconMailInternal = ({ size = 20, color = "#f59e0b" }: IconProps) => <Mail size={size} color={color} />;
export const IconLocation = ({ size = 20, color = "#f59e0b" }: IconProps) => <MapPin size={size} color={color} />;
export const IconUser = ({ size = 24, color = "white" }: IconProps) => <User size={size} color={color} />;
export const IconChevronDown = ({ size = 16, color = "white" }: IconProps) => <ChevronDown size={size} color={color} />;
export const IconStar = ({ size = 16, color = "#fbbf24" }: IconProps) => <Star size={size} color={color} fill={color} />;
export const IconShield = ({ size = 40, color = "#10b981" }: IconProps) => <ShieldCheck size={size} color={color} />;
export const IconZap = ({ size = 40, color = "#fbbf24" }: IconProps) => <Zap size={size} color={color} />;
export const IconMessage = ({ size = 20, color = "#10b981" }: IconProps) => <MessageSquare size={size} color={color} />;
export const IconCamera = ({ size = 24, color = "black" }: IconProps) => <Camera size={size} color={color} />;
// New Exports
export const IconImage = ({ size = 24, color = "white" }: IconProps) => <Image size={size} color={color} />;
export const IconTrash = ({ size = 24, color = "#ef4444" }: IconProps) => <Trash2 size={size} color={color} />;