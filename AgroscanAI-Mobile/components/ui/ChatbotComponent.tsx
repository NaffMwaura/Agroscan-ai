import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Send } from 'lucide-react-native';
import { GEMINI_API_URL, GEMINI_API_KEY } from '../../api/config';

const systemPrompt = "You are AgroBot, an expert agricultural advisor specializing in tea crop health...";

export default function ChatbotComponent() {
  const [messages, setMessages] = useState([
    { id: '1', text: "Hello! I am AgroBot. How can I assist you today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSendMessage = async () => {
    if (!input.trim() || isSending) return;

    const userMsg = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const userQuery = input;
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
        })
      });

      const result = await response.json();
      const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Error getting response.";
      
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiText, sender: 'ai' }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', text: "Connection error. Please check your internet.", sender: 'system' }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={styles.chatWrapper}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[
            styles.bubble, 
            item.sender === 'user' ? styles.userBubble : 
            item.sender === 'system' ? styles.systemBubble : styles.aiBubble
          ]}>
            <Text style={item.sender === 'user' ? styles.userText : styles.aiText}>
              {item.text}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask AgroBot..."
          placeholderTextColor="#999"
          // FIX: Change 'disabled' to 'editable'
          editable={!isSending} 
          multiline={false}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, (!input.trim() || isSending) && styles.disabledBtn]} 
          onPress={handleSendMessage}
          disabled={!input.trim() || isSending}
        >
          {isSending ? <ActivityIndicator color="white" size="small" /> : <Send color="white" size={20} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  chatWrapper: { flex: 1, backgroundColor: '#f9fafb' },
  listContent: { padding: 15, paddingBottom: 20 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 15, marginVertical: 5 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#059669', borderBottomRightRadius: 2 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#e5e7eb', borderTopLeftRadius: 2 },
  systemBubble: { alignSelf: 'center', backgroundColor: '#fee2e2', width: '90%' },
  userText: { color: 'white', fontSize: 15 },
  aiText: { color: '#1f2937', fontSize: 15 },
  inputArea: { 
    flexDirection: 'row', 
    padding: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#eee', 
    backgroundColor: 'white', 
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 30 : 12 // Adjust for iOS home indicator
  },
  input: { 
    flex: 1, 
    backgroundColor: '#f3f4f6', 
    borderRadius: 25, 
    paddingHorizontal: 20, 
    height: 45, 
    marginRight: 10,
    color: '#000'
  },
  sendBtn: { 
    backgroundColor: '#059669', 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  disabledBtn: { backgroundColor: '#a7f3d0' }
});