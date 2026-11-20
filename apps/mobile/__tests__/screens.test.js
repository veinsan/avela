import { fireEvent, render, screen } from '@testing-library/react-native';

import PartnerSection from '../src/components/PartnerSection';
import { AppText, TextField } from '../src/components/ui';
import EmergencyScreen from '../src/screens/EmergencyScreen';
import { todayHours, todayIndex } from '../src/screens/FacilitiesScreen';
import { forecastAhead, forecastTrend, ispuPosition, peakPoint } from '../src/screens/HomeScreen';

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
  expect(screen.getByText(/Sumber: FlowGanic · Data contoh \(mock\).*Data tersimpan/)).toBeTruthy();
});

test('the emergency screen needs no data and lists 119 and 112', async () => {
  await render(<EmergencyScreen />);
  expect(screen.getByText('Telepon 119')).toBeTruthy();
  expect(screen.getByText('Telepon 112')).toBeTruthy();
  expect(screen.getByText(/bukan pertolongan darurat/)).toBeTruthy();
});

test('forecast shows only future hours', async () => {
  const now = Date.parse('2026-11-20T02:30:00Z');
  const series = [{ validAt: '2026-11-20T02:00:00Z', value: 1 }, { validAt: '2026-11-20T03:00:00Z', value: 2 }];
  expect(forecastAhead(series, now)).toEqual([series[1]]);
});

test('the forecast legend names the highest hour and skips missing ones', () => {
  const points = [{ validAt: 'a', value: null }, { validAt: 'b', value: 30 }, { validAt: 'c', value: 12 }];
  expect(peakPoint(points)).toBe(points[1]);
  expect(peakPoint([{ validAt: 'a', value: null }])).toBeNull();
});

test('the forecast trend compares this hour with the last forecast hour that has a value', () => {
  const now = { value: 30 };
  expect(forecastTrend(now, [{ value: 35 }, { value: 41 }, { value: null }]).word).toBe('naik');
  expect(forecastTrend(now, [{ value: 22 }]).word).toBe('turun');
  expect(forecastTrend(now, [{ value: 30.04 }]).word).toBe('tetap'); // same to one decimal
  expect(forecastTrend({ value: null }, [{ value: 22 }])).toBeNull();
  expect(forecastTrend(now, [{ value: null }])).toBeNull();
});

test('the ISPU scale places a mean inside its own band', () => {
  expect(ispuPosition(0)).toBe(0);
  expect(ispuPosition(15.5)).toBeCloseTo(0.2); // top of Baik
  expect(ispuPosition(35.45)).toBeCloseTo(0.3); // middle of Sedang
  expect(ispuPosition(900)).toBe(1); // off the top stays at the end
});

test("today's hours use WIB and keep unknown apart from closed", async () => {
  const sundayNightUtc = Date.parse('2026-11-22T18:00:00Z'); // Monday 01.00 WIB
  expect(todayIndex(sundayNightUtc)).toBe(0);
  const facility = { schedule: [{ day: 'mon', hours: null }] };
  expect(todayHours(facility, sundayNightUtc)).toBe('Tidak diketahui');
  expect(todayHours({ schedule: null })).toBe('Tidak diketahui');
});

test('a password field starts hidden and can be revealed', async () => {
  await render(<TextField label="Kata sandi" secureTextEntry value="rahasia" />);
  expect(screen.getByLabelText('Kata sandi').props.secureTextEntry).toBe(true);
  await fireEvent.press(screen.getByLabelText('Tampilkan kata sandi'));
  expect(screen.getByLabelText('Kata sandi').props.secureTextEntry).toBe(false);
  expect(screen.getByLabelText('Sembunyikan kata sandi')).toBeTruthy();
});
