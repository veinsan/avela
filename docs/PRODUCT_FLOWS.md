# Product Flows

**Updated:** 12 November 2026. Stories and acceptance criteria are in [PRD.md](PRD.md). All accounts, staff, and cases in the coursework are fictional and the app says so.

## Flow A: Before Exposure (resident, no account needed)

1. The resident opens Beranda. The app picks the nearest pilot area from the device location, or the resident chooses Pekanbaru or Palangka Raya in Pilih Wilayah.
2. Beranda shows the PM2.5 forecast for the area: value, unit, valid time, source, the label "Prakiraan model", and how old the snapshot is. Below it: the forecast for the next hours and the number of reports from the area in the last 7 days.
3. The resident opens Panduan for protection guidance, each item with its source.
4. Darurat is one tap away on every screen and needs no account.
5. From Beranda the resident can start a report or open Fasilitas.

| Condition | Behavior |
| --- | --- |
| Location denied | Pilih Wilayah opens; nothing else is blocked. |
| Snapshot older than 2 hours | The value is shown with "Data tersimpan" and its time. |
| No snapshot | "Data kualitas udara belum tersedia." No value, no category. |
| Category breakpoints not sourced | The value is shown without a category. |
| Community count hidden | "Belum cukup data." |

## Flow B: Report Symptoms from Home (resident, signed in)

1. Laporan asks the resident to sign in. The screen states that staff are simulated and that sending a report is not emergency help.
2. Form Laporan collects the complaint, when it started, whether it is getting better, unchanged, or worse, optional context, the area, and the facility. Errors appear next to the field and typed values are kept.
3. The resident reviews and sends. The app sends an idempotency key, so a retry after a network failure cannot create a second report.
4. Detail Laporan shows "Terkirim, belum ditinjau", the timeline, and the exposure context: mean and peak forecast PM2.5 for the area since the symptoms began, labelled "Prakiraan wilayah, bukan dosis pribadi".
5. When staff ask for more information, the report shows the question and a reply box. The reply returns the report to review.
6. When staff respond, the report shows the response, the reviewer's name, the time, and the disposition: self-care, remote follow-up, or onsite assessment.
7. The resident can cancel a report only while it is still `submitted`.

## Flow C: Onsite Examination and Result (resident)

1. After an onsite-assessment response, Detail Laporan links to Fasilitas.
2. Fasilitas lists facilities from peer group A, names the source, and marks the ones that accept Avela reports. Detail Fasilitas shows services and opening hours, or "tidak diketahui".
3. After the examination, staff publish a result linked to the report.
4. Hasil Pemeriksaan shows the result, its author, facility, and time. Only the report's owner can open it.

## Flow D: Review (staff, same app)

1. A staff account signs in and gets the tabs Antrean and Akun.
2. Antrean lists the facility's reports, oldest first, with a state filter.
3. Tinjau Laporan shows the complaint, the timeline, and the exposure context. The staff member claims the report.
4. The reviewer either asks for more information or publishes a response with a disposition. Later the reviewer closes the report.
5. For an onsite examination, Terbitkan Hasil drafts a result and publishes it.
6. If someone else changed the report first, the action fails with a clear message and the screen reloads the report.

## Report States

| State | Meaning | Next state and actor |
| --- | --- | --- |
| `submitted` | Saved in the facility's queue; nobody has looked at it | `in_review` by staff claim; `cancelled` by the owner |
| `in_review` | Claimed by one staff member | `awaiting_information` or `responded` by the reviewer |
| `awaiting_information` | The reviewer asked a question | `in_review` when the owner replies |
| `responded` | A staff response is published | `closed` by the reviewer |
| `closed` | The episode is finished; still readable by the owner | A new complaint is a new report |
| `cancelled` | Withdrawn by the owner before review | None |

An examination result can be drafted once the report is `responded` or `closed`.

## Navigation

| Role | Tabs | Stack screens |
| --- | --- | --- |
| Signed out | Beranda, Laporan (asks to sign in), Fasilitas, Akun (sign in) | Masuk, Pilih Wilayah, Panduan, Darurat, Detail Fasilitas |
| Resident | Beranda, Laporan, Fasilitas, Akun | The above plus Form Laporan, Detail Laporan, Hasil Pemeriksaan |
| Staff | Antrean, Akun | Tinjau Laporan, Terbitkan Hasil, Darurat |

This gives 15 screens (five tabs and ten stack screens) with stack and tab navigation, a login, and a validated form.

## Failure States

| Situation | What the resident or staff member sees |
| --- | --- |
| Loading | A skeleton of the content area |
| Empty list | A sentence that says what will appear here and how to start |
| Core unreachable | "Tidak dapat terhubung. Coba lagi." with a retry button; typed form values are kept |
| Peer service down | "Data fasilitas sedang tidak tersedia." Other tabs keep working |
| Session expired | Return to Masuk, then back to the screen the user was on |
| Version conflict | "Laporan ini baru saja diubah." and a reload |

## Demo Script for the Video

1. Signed out: Beranda for Pekanbaru, switch to Palangka Raya, open Panduan and Darurat.
2. Sign in as `warga1`; submit a report; show "Terkirim, belum ditinjau" and the exposure context.
3. Sign in as `petugas1`; claim, ask for information.
4. As `warga1`, reply. As `petugas1`, respond with onsite assessment.
5. As `warga1`, open Fasilitas (peer A) and the second peer feature.
6. As `petugas1`, publish a result. As `warga1`, open it.
7. Failures: stop the integration service to show a stale advisory and the peer-down state; sign in as `warga2` and show that `warga1`'s report is not found; show a `petugas2` queue without the report.
8. From a terminal: call the health signal with a peer key, then without one.
