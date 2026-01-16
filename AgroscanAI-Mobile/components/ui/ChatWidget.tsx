import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bot, X, MessageCircle } from 'lucide-react-native';
import ChatbotComponent from './ChatbotComponent';

export default function ChatWidget() {
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <MessageCircle color="white" size={30} />
      </TouchableOpacity>

      {/* Full Screen Chat Modal */}
      <Modal 
        visible={visible} 
        animationType="slide" 
        presentationStyle="fullScreen"
        onRequestClose={() => setVisible(false)}
      >
        <View style={[
          styles.modalContainer, 
          { paddingTop: insets.top, paddingBottom: insets.bottom }
        ]}>
          <View style={styles.chatHeader}>
            <View style={styles.headerTitle}>
              <Bot color="white" size={24} />
              <Text style={styles.headerText}>AgroBot Assistant</Text>
            </View>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
              <X color="white" size={28} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.chatContent}>
            <ChatbotComponent />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', 
    right: 25,
    // FIX: Set this to 125 to clear the floating tabs (75 height + 20 bottom margin + gap)
    bottom: 125, 
    backgroundColor: '#10b981', 
    width: 65, 
    height: 65,
    borderRadius: 32.5, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 10, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 9999, 
  },
  modalContainer: { flex: 1, backgroundColor: '#064e3b' },
  chatHeader: { 
    height: 70, 
    backgroundColor: '#065f46', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
  },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  closeBtn: { padding: 5 },
  chatContent: { flex: 1, backgroundColor: '#f9fafb' }, 
});