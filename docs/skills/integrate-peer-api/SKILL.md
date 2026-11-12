---
name: integrate-peer-api
description: Use when adding, replacing, or reviewing the integration of another student group's API in Avela.
---

# Integrate a Peer API

The course requires two different groups' services in real features, a written agreement in both groups' READMEs, and proof of the calls. Run this procedure once per group. Public APIs such as Open-Meteo do not count.

## Inputs

- The group's row in the class API Registry: name, class, base URL, documentation, auth type, status.
- Their documentation and DDD paper. The video must respond to their design, so note one strength and one question while reading.
- The slot this group fills, from "Peer Integration Slots" in [API_CONTRACT](../../API_CONTRACT.md).

## Procedure

1. **Check that it is usable.** Call their health or simplest endpoint. If it is not live, ask for their OpenAPI file or Postman collection and continue with a mock built from it.
2. **Send the request.** Use the message below. Ask for a key and a test account.
3. **Record the agreement.** Add a section for the group to the backend README source with the table below. Ask them to add the matching section to theirs.
4. **Write the adapter** in `services/integration`. One module per group. It maps their fields to Avela's names, stops waiting after 10 seconds, caches the last good answer, and returns the envelope `source`, `retrievedAt`, `freshness`. Their key goes in the integration service's `.env`.
5. **Save a fixture.** Store one real response, with any personal data removed, next to the adapter's tests.
6. **Test the failures.** With stubbed responses: timeout, 429, malformed body, empty list. Each must give an unavailable or stale envelope, never an exception.
7. **Wire the feature.** Add the call to `ApiService.js` and show the data in its screen with the group's name as the source.
8. **Collect proof.** Capture a request log line and a screenshot of the feature. Add both to the README and plan the shot for the video.
9. **Update the documents.** Fill the slot in API_CONTRACT, resolve Q-03 in DECISIONS when both groups are fixed, and update the A-03 and A-10 rows in TODO.

## Request Message

```text
Halo, kami kelompok Avela (K01, tema Health & Wellbeing).
Kami ingin memakai API kalian untuk fitur <nama fitur> di aplikasi kami.
Endpoint yang kami butuhkan: <daftar endpoint>.
Boleh minta API key, satu akun uji, dan batas pemanggilan yang kalian izinkan?
Kesepakatannya kami catat di README kami, dan mohon dicatat juga di README kalian.
API kami: https://avela.stei.fun/docs. Kami siap memberi key bila kalian mau memakainya.
Kontak: <nama dan cara menghubungi>.
```

## Agreement Table

| Field | Value |
| --- | --- |
| Group, class, theme | |
| Contact | |
| Base URL and version | |
| Endpoints used | |
| Data format | |
| Auth and scope | |
| Call limit | |
| Test account | |
| Feature in Avela | |
| Agreed on (date) | |
| Mock in use? | Yes or no; if yes, since when and reported to the assistant on which date |

## Rules

- Two endpoints from one group are still one group.
- A mock is allowed only when the peer is late after the Registry deadline of 29 November. Label it as a mock in the app, the README, and the video, and report the delay to the assistant.
- Never put a peer's key in the app or in Git.
- Send no report, account, or result data to a peer.
- Report a peer's bug as a GitHub issue on their repository.

## Output

Report the group and slot, the endpoints wired, the tests run with their results, the proof captured, and anything still waiting on the peer.
