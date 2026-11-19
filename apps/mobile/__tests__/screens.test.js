import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import PartnerSection from '../src/components/PartnerSection';
import { AppText } from '../src/components/ui';
import EmergencyScreen from '../src/screens/EmergencyScreen';
import { todayHours, todayIndex } from '../src/screens/FacilitiesScreen';
import { forecastAhead } from '../src/screens/HomeScreen';

const METRICS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

test('a partner outage collapses to one line and hides the content', async () => {
  await render(
    <PartnerSection envelope={{ source: 'Veriqu', freshness: 'unavailable', data: null }}>
      <AppText>Masker</AppText>
    </PartnerSection>,
  );
  expect(screen.getByText('Data mitra sedang tidak tersedia.')).toBeTruthy();
  expect(screen.queryByText('Masker')).toBeNull();
});

test('partner data names its source and says when it is a mock or stale', async () => {
  await render(
    <PartnerSection envelope={{ source: 'FlowGanic', freshness: 'stale', isMock: true, data: {},
      retrievedAt: '2026-11-20T02:00:00Z' }}>
      <AppText>Organik</AppText>
    </PartnerSection>,
  );
  expect(screen.getByText('Organik')).toBeTruthy();
  expect(screen.getByText('Sumber: FlowGanic')).toBeTruthy();
  expect(screen.getByText('Data contoh (mock)')).toBeTruthy();
  expect(screen.getByText(/Data tersimpan, mitra sedang tidak tersedia/)).toBeTruthy();
});

test('the emergency screen needs no data and lists 119 and 112', async () => {
  await render(<SafeAreaProvider initialMetrics={METRICS}><EmergencyScreen /></SafeAreaProvider>);
  expect(screen.getByLabelText(/Telepon 119/)).toBeTruthy();
  expect(screen.getByLabelText(/Telepon 112/)).toBeTruthy();
  expect(screen.getByText(/bukan pertolongan darurat/)).toBeTruthy();
});

test('forecast shows only future hours', async () => {
  const now = Date.parse('2026-11-20T02:30:00Z');
  const series = [{ validAt: '2026-11-20T02:00:00Z', value: 1 }, { validAt: '2026-11-20T03:00:00Z', value: 2 }];
  expect(forecastAhead(series, now)).toEqual([series[1]]);
});

test("today's hours use WIB and keep unknown apart from closed", async () => {
  const sundayNightUtc = Date.parse('2026-11-22T18:00:00Z'); // Monday 01.00 WIB
  expect(todayIndex(sundayNightUtc)).toBe(0);
  const facility = { schedule: [{ day: 'mon', hours: null }] };
  expect(todayHours(facility, sundayNightUtc)).toBe('Tidak diketahui');
  expect(todayHours({ schedule: null })).toBe('Tidak diketahui');
});
