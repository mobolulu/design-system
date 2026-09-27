import React, { useState } from 'react';
import { ScrollView, Text, View, StyleSheet, StatusBar } from 'react-native';
import {
  Button,
  Card,
  Badge,
  Tag,
  StatusPill,
  Input,
  Switch,
  Avatar,
  Spinner,
  VStack,
  HStack,
  Alert,
  Logo,
  theme,
} from '@mobolulu/design-system-mobile';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.neutral[50] },
  container: { padding: 16, gap: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  h1: { fontSize: 22, fontWeight: '800', color: theme.colors.brand.primary },
  subtitle: { fontSize: 13, color: theme.colors.neutral[500] },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.brand.dark, marginBottom: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});

export default function App() {
  const [switchOn, setSwitchOn] = useState(true);
  const [email, setEmail] = useState('collector@mobolulu.id');

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.titleRow}>
          <Logo variant="icon" size={40} />
          <View>
            <Text style={styles.h1}>MOBOLULU Design System</Text>
            <Text style={styles.subtitle}>@mobolulu/design-system-mobile · live preview</Text>
          </View>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Buttons</Text>
          <VStack gap={3}>
            <HStack gap={3}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </HStack>
            <HStack gap={3}>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
              <Button loading>Loading</Button>
            </HStack>
          </VStack>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Status & Badges</Text>
          <View style={styles.wrap}>
            <StatusPill status="VERIFIED" />
            <StatusPill status="ACTIVE" />
            <StatusPill status="SUSPENDED" />
            <StatusPill status="PENDING" />
            <Badge status="SUCCESS">Success</Badge>
            <Badge status="WARNING">Warning</Badge>
            <Badge status="ERROR">Error</Badge>
            <Tag color={theme.colors.brand.primary}>Recycling</Tag>
            <Tag color={theme.colors.brand.green}>Organic</Tag>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Form</Text>
          <VStack gap={4}>
            <Input label="Email" placeholder="you@mobolulu.id" value={email} onChangeText={setEmail} />
            <Switch label="Available for dispatch" value={switchOn} onValueChange={setSwitchOn} />
          </VStack>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Alerts</Text>
          <VStack gap={3}>
            <Alert tone="success" title="Saved">Order category created.</Alert>
            <Alert tone="warning" title="Heads up">Low wallet balance.</Alert>
            <Alert tone="error" title="Failed">Payment declined.</Alert>
            <Alert tone="info">Dispatch started.</Alert>
          </VStack>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Avatars & Spinner</Text>
          <HStack gap={3} align="center">
            <Avatar name="Budi Santoso" />
            <Avatar name="Ana" size="lg" />
            <Spinner size="lg" />
          </HStack>
        </Card>

        <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 8 }]}>
          Built with @mobolulu/design-system-mobile
        </Text>
      </ScrollView>
    </View>
  );
}
