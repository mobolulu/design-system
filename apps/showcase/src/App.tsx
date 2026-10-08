import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Button,
  Card,
  Badge,
  Tag,
  StatusPill,
  Input,
  TextArea,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Avatar,
  Spinner,
  VStack,
  HStack,
  Alert,
  Modal,
  Logo,
  DataTable,
  type DataTableColumn,
  Text,
  Skeleton,
  SkeletonCard,
  SkeletonList,
  EmptyState,
  Money,
} from '@mobolulu/design-system-web';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="mb-4 text-lg font-bold text-brand-dark">{title}</h2>
    <div className="flex flex-wrap gap-4">{children}</div>
  </section>
);

// ---- sample data for the DataTable demo ----
interface Collector {
  id: string;
  name: string;
  status: string;
  area: string;
  pickups: number;
}
const collectors: Collector[] = [
  { id: 'C1', name: 'Budi Santoso', status: 'VERIFIED', area: 'Jakarta', pickups: 42 },
  { id: 'C2', name: 'Ana Wijaya', status: 'ACTIVE', area: 'Bandung', pickups: 18 },
  { id: 'C3', name: 'Joko Prasetyo', status: 'SUSPENDED', area: 'Jakarta', pickups: 3 },
  { id: 'C4', name: 'Siti Rahayu', status: 'VERIFIED', area: 'Surabaya', pickups: 67 },
  { id: 'C5', name: 'Dedi Kurniawan', status: 'ACTIVE', area: 'Bandung', pickups: 25 },
  { id: 'C6', name: 'Rina Marlina', status: 'VERIFIED', area: 'Surabaya', pickups: 51 },
  { id: 'C7', name: 'Agus Salim', status: 'SUSPENDED', area: 'Jakarta', pickups: 1 },
  { id: 'C8', name: 'Maya Sari', status: 'ACTIVE', area: 'Bandung', pickups: 33 },
  { id: 'C9', name: 'Eko Prasetyo', status: 'VERIFIED', area: 'Surabaya', pickups: 44 },
  { id: 'C10', name: 'Nur Aini', status: 'ACTIVE', area: 'Jakarta', pickups: 12 },
  { id: 'C11', name: 'Hendra Gunawan', status: 'VERIFIED', area: 'Bandung', pickups: 29 },
  { id: 'C12', name: 'Fitri Handayani', status: 'SUSPENDED', area: 'Surabaya', pickups: 2 },
];
const collectorColumns: DataTableColumn<Collector>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  {
    key: 'status',
    header: 'Status',
    filterable: true,
    render: (r) => <StatusPill status={r.status} />,
  },
  { key: 'area', header: 'Area', filterable: true },
  { key: 'pickups', header: 'Pickups' },
];

function WebsiteView() {
  const [modalOpen, setModalOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(true);
  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState('a');
  const [category, setCategory] = useState('kg');

  return (
    <div>
      <Section title="Buttons">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button loading>Loading</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
      </Section>

      <Section title="Status & Badges">
        <StatusPill status="VERIFIED" />
        <StatusPill status="ACTIVE" />
        <StatusPill status="SUSPENDED" />
        <StatusPill status="PENDING" />
        <StatusPill status="COMPLETED" />
        <Badge status="SUCCESS">Success</Badge>
        <Badge status="WARNING">Warning</Badge>
        <Badge status="ERROR">Error</Badge>
        <Tag color="#15803D">Recycling</Tag>
        <Tag color="#22C55E">Organic</Tag>
      </Section>

      <Section title="DataTable (search + filter + pagination)">
        <DataTable columns={collectorColumns} data={collectors} pageSize={5} searchPlaceholder="Search collectors..." />
      </Section>

      <Section title="Cards & Alerts">
        <Card className="max-w-xs">
          <h3 className="mb-1 font-semibold text-brand-dark">Collector summary</h3>
          <p className="text-sm text-neutral-600">12 pickups completed this week. Rating 4.8.</p>
        </Card>
        <VStack gap={3} className="max-w-xs">
          <Alert tone="success" title="Saved">Order category created.</Alert>
          <Alert tone="warning" title="Heads up">Low wallet balance.</Alert>
          <Alert tone="error" title="Failed">Payment declined.</Alert>
          <Alert tone="info">Dispatch started.</Alert>
        </VStack>
      </Section>

      <Section title="Form controls">
        <VStack gap={4} className="max-w-sm">
          <Input label="Email" placeholder="you@mobolulu.id" defaultValue="collector@mobolulu.id" />
          <TextArea label="Notes" placeholder="Add a note..." />
          <Select
            label="Category"
            value={category}
            onValueChange={setCategory}
            options={[
              { label: 'Plastic (kg)', value: 'kg' },
              { label: 'Paper (kg)', value: 'paper' },
              { label: 'Glass (kg)', value: 'glass' },
            ]}
          />
          <Checkbox label="Notify me on pickup" checked={checked} onCheckedChange={(c) => setChecked(c === true)} />
          <RadioGroup label="Pickup priority" orientation="horizontal" value={radio} onValueChange={setRadio}>
            <Radio value="a" label="Option A" />
            <Radio value="b" label="Option B" />
          </RadioGroup>
          <Switch label="Available for dispatch" checked={switchOn} onCheckedChange={setSwitchOn} />
        </VStack>
      </Section>

      <Section title="Text">
        <VStack gap={2}>
          <Text as="h1" variant="display">Display</Text>
          <Text as="h2" variant="title">Title</Text>
          <Text as="h3" variant="heading">Heading</Text>
          <Text as="p" variant="body">Body — the default role for ordinary copy.</Text>
          <Text as="label" variant="label">Label</Text>
          <Text variant="caption" tone="neutral">Caption, de-emphasised</Text>
          <Text variant="mono">mono · ORD-2041</Text>
          <Text variant="numeric">50.000 (tabular figures)</Text>
        </VStack>
      </Section>

      <Section title="Money">
        <VStack gap={2}>
          <Money minor={50000} />
          <Money minor={1250000} variant="title" />
          <Money minor={12500} showPrefix={false} />
          <Money minor={9000} tone="error" />
        </VStack>
      </Section>

      <Section title="Skeleton (loading state)">
        <VStack gap={4} className="max-w-sm">
          <Skeleton width="60%" height={20} />
          <SkeletonCard />
          <SkeletonList count={3} />
        </VStack>
      </Section>

      <Section title="EmptyState">
        <Card className="max-w-sm">
          <EmptyState
            icon={<span className="text-3xl">📭</span>}
            title="No orders yet"
            description="New orders show up here as soon as a client books a pickup."
            action={<Button size="sm">Create an order</Button>}
          />
        </Card>
      </Section>

      <Section title="Avatars & Spinners">
        <Avatar name="Budi Santoso" />
        <Avatar name="Ana" size="lg" />
        <Avatar src="https://i.pravatar.cc/100?img=12" />
        <Spinner />
        <Spinner size="lg" />
      </Section>

      <Section title="Layout & Modal">
        <HStack gap={4}>
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Button variant="ghost" onClick={() => setModalOpen(true)}>Show dialog</Button>
        </HStack>
      </Section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirm dispatch"
        footer={
          <HStack gap={3} justify="end">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Confirm</Button>
          </HStack>
        }
      >
        <p className="text-sm text-neutral-600">Assign this order to the nearest verified collector?</p>
      </Modal>
    </div>
  );
}

function MobileView() {
  // The Expo preview URL is injected at build time via VITE_EXPO_URL.
  // When set, we render a scannable QR; otherwise we show setup instructions.
  const expoUrl = import.meta.env.VITE_EXPO_URL as string | undefined;
  const components = [
    'Button', 'Card', 'Badge', 'Tag', 'StatusPill', 'Input',
    'Switch', 'Avatar', 'Spinner', 'Stack (VStack/HStack)', 'Alert', 'Logo',
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="mb-6">
        <h3 className="mb-2 text-base font-semibold text-brand-dark">Scan with the Expo Go app</h3>
        {expoUrl ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <QRCodeSVG value={expoUrl} size={220} fgColor="#15803D" level="M" />
            </div>
            <p className="text-center text-sm text-neutral-600">
              Open <strong>Expo Go</strong> on your Android phone and scan this code to
              launch the live MOBOLULU mobile design system.
            </p>
            <code className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-600">{expoUrl}</code>
          </div>
        ) : (
          <div className="py-2">
            <Alert tone="info" title="QR not configured yet">
              The Expo preview URL is set via the <code>VITE_EXPO_URL</code> build variable.
              Once an Expo dev tunnel or EAS preview build is running, the QR appears here automatically.
            </Alert>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-neutral-700">
              <li>Install <strong>Expo Go</strong> from the Google Play Store on your Android phone.</li>
              <li>We start the Expo app (dev tunnel or EAS preview) and paste its URL into <code>VITE_EXPO_URL</code>.</li>
              <li>Scan the QR above — the native app opens and renders every component.</li>
            </ol>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 text-base font-semibold text-brand-dark">Mobile components</h3>
        <div className="flex flex-wrap gap-2">
          {components.map((c) => (
            <Tag key={c} color="#15803D">{c}</Tag>
          ))}
        </div>
        <p className="mt-4 text-sm text-neutral-500">
          These are React Native components from <code>@mobolulu/design-system-mobile</code>.
          They render natively on your phone (React Native can't run inside a browser), which is
          why the live preview is delivered via the Expo QR above.
        </p>
      </Card>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<'website' | 'mobile'>('website');

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo height={44} />
          <div>
            <h1 className="text-2xl font-extrabold text-brand-primary">MOBOLULU Design System</h1>
            <p className="text-sm text-neutral-500">@mobolulu/design-system-web · live component gallery</p>
          </div>
        </div>
        <nav className="flex gap-2">
          <Button variant={view === 'website' ? 'primary' : 'ghost'} onClick={() => setView('website')}>
            Website
          </Button>
          <Button variant={view === 'mobile' ? 'primary' : 'ghost'} onClick={() => setView('mobile')}>
            Mobile
          </Button>
        </nav>
      </header>

      {view === 'website' ? <WebsiteView /> : <MobileView />}

      <footer className="mt-12 border-t border-neutral-200 pt-6 text-sm text-neutral-400">
        Built with @mobolulu/design-system-web · brand tokens from the MOBOLULU logo.
      </footer>
    </div>
  );
}
