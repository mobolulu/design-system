import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
  Screen,
  Text,
  Skeleton,
  SkeletonCard,
  SkeletonList,
  EmptyState,
  Money,
  BottomSheet,
  ListRow,
  theme,
} from '@mobolulu/design-system-mobile';

type ElevationLevel = keyof typeof theme.elevation;

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionTitle: { marginBottom: 8 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  elevationRow: { flexDirection: 'row', gap: 16 },
  elevationSwatch: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
});

const ELEVATION_LEVELS: ElevationLevel[] = ['flat', 'raised', 'overlay', 'floating'];

export default function App() {
  const [switchOn, setSwitchOn] = useState(true);
  const [email, setEmail] = useState('collector@mobolulu.id');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(true);

  return (
    <Screen
      title="Design System"
      banner={
        <Text variant="caption" tone="neutral">
          @mobolulu/design-system-mobile v0.5 · live preview
        </Text>
      }
    >
      <View style={styles.titleRow}>
        <Logo variant="icon" size={40} />
        <Text variant="title">MOBOLULU</Text>
      </View>

      <Card>
        <Text variant="heading" style={styles.sectionTitle}>
          Typography roles
        </Text>
        <VStack gap={2}>
          <Text variant="display">Display</Text>
          <Text variant="title">Title</Text>
          <Text variant="heading">Heading</Text>
          <Text variant="body">Body — the default paragraph style for screens.</Text>
          <Text variant="label">LABEL</Text>
          <Text variant="caption" tone="neutral">
            Caption — secondary detail text.
          </Text>
          <Text variant="mono">mono · order #0x4F2A</Text>
          <Money minor={1250000} />
        </VStack>
      </Card>

      <Card>
        <Text variant="heading" style={styles.sectionTitle}>
          Elevation
        </Text>
        <View style={styles.elevationRow}>
          {ELEVATION_LEVELS.map((level) => (
            <View key={level} style={{ alignItems: 'center', gap: 6 }}>
              <View style={[styles.elevationSwatch, theme.elevation[level]]} />
              <Text variant="caption" tone="neutral">
                {level}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <View style={styles.sectionHeaderRow}>
          <Text variant="heading">Loading vs. loaded</Text>
          <Button size="sm" variant="ghost" onPress={() => setShowSkeletons((v) => !v)}>
            {showSkeletons ? 'Show content' : 'Show loading'}
          </Button>
        </View>
        <VStack gap={4}>
          {showSkeletons ? (
            <SkeletonCard />
          ) : (
            <Card elevation="flat">
              <ListRow
                title="Order #1042"
                subtitle="2 bags · Collected"
                trailing={<Money minor={25000} />}
                showChevron
              />
            </Card>
          )}
          {showSkeletons ? (
            <SkeletonList count={3} />
          ) : (
            <VStack gap={0}>
              <ListRow
                title="Budi Santoso"
                subtitle="Collector · Online"
                trailing={
                  <Text variant="caption" tone="success">
                    Active
                  </Text>
                }
              />
              <ListRow
                title="Ana Wijaya"
                subtitle="Collector · Offline"
                trailing={
                  <Text variant="caption" tone="neutral">
                    —
                  </Text>
                }
              />
              <ListRow
                title="Dedi Saputra"
                subtitle="Collector · Online"
                trailing={
                  <Text variant="caption" tone="success">
                    Active
                  </Text>
                }
              />
            </VStack>
          )}
        </VStack>
      </Card>

      <Card>
        <Text variant="heading" style={styles.sectionTitle}>
          Empty state
        </Text>
        <EmptyState
          title="No orders yet"
          description="New pickup requests will show up here."
          action={
            <Button size="sm" onPress={() => {}}>
              Create an order
            </Button>
          }
        />
      </Card>

      <Card>
        <Text variant="heading" style={styles.sectionTitle}>
          Bottom sheet
        </Text>
        <Button onPress={() => setSheetOpen(true)}>Confirm pickup…</Button>
        <BottomSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title="Confirm pickup"
          footer={
            <Button fullWidth onPress={() => setSheetOpen(false)}>
              Confirm
            </Button>
          }
        >
          <VStack gap={2}>
            <Text variant="body">2 bags · Recycling</Text>
            <Money minor={10000} />
          </VStack>
        </BottomSheet>
      </Card>

      <Card>
        <Text variant="heading" style={styles.sectionTitle}>
          Buttons
        </Text>
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
        <Text variant="heading" style={styles.sectionTitle}>
          Status & Badges
        </Text>
        <View style={styles.wrap}>
          <StatusPill status="VERIFIED" />
          <StatusPill status="ACTIVE" />
          <StatusPill status="SUSPENDED" />
          <StatusPill status="PENDING" />
          <Badge status="SUCCESS">Success</Badge>
          <Badge status="WARNING">Warning</Badge>
          <Badge status="ERROR">Error</Badge>
          <Tag color="#15803D">Recycling</Tag>
          <Tag color="#22C55E">Organic</Tag>
        </View>
      </Card>

      <Card>
        <Text variant="heading" style={styles.sectionTitle}>
          Form
        </Text>
        <VStack gap={4}>
          <Input label="Email" placeholder="you@mobolulu.id" value={email} onChangeText={setEmail} />
          <Switch label="Available for dispatch" value={switchOn} onValueChange={setSwitchOn} />
        </VStack>
      </Card>

      <Card>
        <Text variant="heading" style={styles.sectionTitle}>
          Alerts
        </Text>
        <VStack gap={3}>
          <Alert tone="success" title="Saved">
            Order category created.
          </Alert>
          <Alert tone="warning" title="Heads up">
            Low wallet balance.
          </Alert>
          <Alert tone="error" title="Failed">
            Payment declined.
          </Alert>
          <Alert tone="info">Dispatch started.</Alert>
        </VStack>
      </Card>

      <Card>
        <Text variant="heading" style={styles.sectionTitle}>
          Avatars & Spinner
        </Text>
        <HStack gap={3} align="center">
          <Avatar name="Budi Santoso" />
          <Avatar name="Ana" size="lg" />
          <Spinner size="lg" />
        </HStack>
      </Card>

      <Text variant="caption" tone="neutral" style={{ textAlign: 'center', marginTop: 8 }}>
        Built with @mobolulu/design-system-mobile
      </Text>
    </Screen>
  );
}
