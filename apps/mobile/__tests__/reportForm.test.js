import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as Api from '../src/services/ApiService';
import ReportFormScreen from '../src/screens/ReportFormScreen';

jest.mock('../src/services/ApiService', () => ({
  createReport: jest.fn(),
  listFacilities: jest.fn(() => Promise.resolve({ items: [{ id: 'demo-facility-001', name: 'Puskesmas A' }] })),
  newIdempotencyKey: jest.fn(() => 'avela-key-1'),
}));
jest.mock('../src/context/AreaContext', () => ({ useArea: () => ({ area: { id: 'pekanbaru', name: 'Pekanbaru' } }) }));
jest.mock('../src/context/UpdatesContext', () => ({
  useUpdates: () => ({ refresh: () => Promise.resolve(), markSeen: () => {} }),
}));
jest.mock('@react-navigation/native', () => ({ useFocusEffect: () => {}, useNavigation: () => ({}) }));

const METRICS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };
const renderForm = (navigation) =>
  render(<SafeAreaProvider initialMetrics={METRICS}><ReportFormScreen navigation={navigation} /></SafeAreaProvider>);

async function fillValidForm() {
  await fireEvent.press(await screen.findByText('Puskesmas A'));
  await fireEvent.changeText(screen.getByLabelText('Apa yang Anda rasakan?'), 'Batuk dan mata perih');
  await fireEvent.changeText(screen.getByLabelText('Mulai berapa jam yang lalu?'), '3');
  await fireEvent.press(screen.getByText('Memburuk'));
  await fireEvent.press(screen.getByText(/bukan layanan darurat/));
}

test('invalid fields show messages and nothing is sent', async () => {
  await renderForm({ replace: jest.fn() });
  await fireEvent.press(screen.getByText('Periksa laporan'));
  expect(screen.getByText('Pilih fasilitas tujuan.')).toBeTruthy();
  expect(screen.getByText('Tuliskan keluhan, minimal 3 huruf.')).toBeTruthy();
  expect(screen.getByText('Isi dengan angka jam, misalnya 3.')).toBeTruthy();
  expect(Api.createReport).not.toHaveBeenCalled();
});

test('a retry after a network failure resends the same payload and key', async () => {
  const navigation = { replace: jest.fn() };
  Api.createReport
    .mockRejectedValueOnce(Object.assign(new Error('Tidak dapat terhubung. Coba lagi.'), { retryable: true }))
    .mockResolvedValueOnce({ id: 'r1' });
  await renderForm(navigation);
  await fillValidForm();
  await fireEvent.press(screen.getByText('Periksa laporan'));
  await fireEvent.press(screen.getByText('Kirim laporan'));
  expect(await screen.findByText('Tidak dapat terhubung. Coba lagi.')).toBeTruthy();
  expect(screen.getByText('Batuk dan mata perih')).toBeTruthy(); // typed values kept
  await fireEvent.press(screen.getByText('Kirim ulang'));

  const [first, second] = Api.createReport.mock.calls;
  expect(second).toEqual(first);
  expect(first[1]).toBe('avela-key-1');
  expect(first[0]).toMatchObject({ areaId: 'pekanbaru', facilityId: 'demo-facility-001', course: 'worse',
    consentVersion: 'demo-v1', additionalContext: null });
  expect(navigation.replace).toHaveBeenCalledWith('DetailLaporan', { id: 'r1', justSent: true });
});
