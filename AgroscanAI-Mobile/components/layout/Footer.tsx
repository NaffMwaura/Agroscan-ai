import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerBrand}>AgroScan AI</Text>
      <Text style={styles.footerText}>Precision diagnosis for a healthier harvest.</Text>
      
      <View style={styles.divider} />
      
      <View style={styles.contactRow}>
        <Text style={styles.contactText}>support@agroscan.ai</Text>
        <Text style={styles.contactText}>AgTech Hub, HQ</Text>
      </View>
      
      <Text style={styles.copyright}>
        © {new Date().getFullYear()} AgroScan AI. All rights reserved.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { backgroundColor: '#064e3b', padding: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#065f46' },
  footerBrand: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  footerText: { color: '#a7f3d0', textAlign: 'center', marginBottom: 20 },
  divider: { width: '100%', height: 1, backgroundColor: '#065f46', marginVertical: 20 },
  contactRow: { marginBottom: 20, alignItems: 'center' },
  contactText: { color: '#a7f3d0', fontSize: 14, marginVertical: 2 },
  copyright: { color: '#059669', fontSize: 12 }
});