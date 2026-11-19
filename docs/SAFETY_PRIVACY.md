# Clinical Boundaries, Privacy, and Secrets

**Updated:** 19 November 2026. This is the one place where Avela's clinical and privacy limits are written. Other documents link here.

Avela is a coursework prototype with fictional people. It is not a clinical protocol, a legal compliance assessment, or a telemedicine service.

## Clinical Boundaries

- Software never diagnoses, prescribes, or rates a person's health. Assessments and instructions come from staff.
- Environmental data describes an area and a period. The exposure context on a report is an area forecast, labelled "Prakiraan wilayah, bukan dosis pribadi".
- A submitted report is a receipt. It is not review, monitoring, or emergency help, and the app says so on the form and on the report.
- The app promises no response time.
- Staff, facilities, and cases are simulated and labelled "Simulasi tugas kuliah".
- A real pilot would need clinical ownership, reviewer credentials, approved content, and an escalation process. None exists.

## Emergency Access

The Darurat screen opens from every screen, signed in or not, and never requires a report. It shows 119, the Kemenkes medical emergency service, and 112, the national emergency number (D-33, S-10). Do not copy emergency numbers from foreign sources. The app never tells a resident they are safe because nothing was flagged.

A smoke forecast is not an evacuation order and does not make a route or a home safe.

## Data Classes

| Class | Examples | Handling |
| --- | --- | --- |
| Public context | PM2.5 snapshots, guidance | Stored with source and time; shown with attribution |
| Public directory | Simulated facility name, services, schedule | Labelled as simulation |
| Partner data | Veriqu products, FlowGanic waste recap | Shown with the group's name and retrieval time; a product is not medical advice; no resident data is sent to partners |
| Sensitive case data | Reports, events, results | Synthetic only; owner and facility staff only |
| Aggregate signal | Report counts per area and day | Published under the rules below |
| Operational data | Request IDs, error codes | No complaint text in logs |
| Secrets | Passwords, JWT secret, peer keys, tunnel token | `.env` only; never in Git, Markdown, or the APK |

## Access Rules

- The acting account comes from the token. A request cannot name another owner.
- Staff read and act only on their facility's reports. Only the claiming reviewer can respond or close.
- A result's owner comes from its report.
- A resource the caller may not see returns 404.
- Peer keys read area data and the aggregate signal only.

## Area Health Signal Rules

- It contains counts by area, day, and disposition. It contains no complaint text, account, facility, or time of day.
- A count from 1 to 4 is hidden and sent as null (D-30). Zero is sent as zero.
- Cancelled reports are not counted.
- The payload says whether its data is synthetic.
- It is not an outbreak detector and is not presented as one.

## Secrets and Shared Credentials

- The assignment PDF contains the class's shared Cloudflare account credentials. It is git-ignored. Do not commit it, quote the credentials, or paste them into any document, issue, or chat log.
- In the shared account, change only the `k01-avela` tunnel and its hostname, and log out afterwards.
- Peer keys are shown once when created and stored hashed. Revoke a key with `python -m app.keys revoke <label>`, which deletes it.
- Rotate `AVELA_JWT_SECRET` and the demo password if either appears in a commit, screenshot, or video.

## Data Minimization

Collect only what the demo journey needs: complaint, onset, course, optional context, area, facility. No national ID, home address, or exact location is stored; the area is one of two cities. Screenshots and the video show only fictional accounts.

## Guidance Content

Each guidance item carries its source title and link, version, and review status. Unreviewed text is labelled as such in the app.

## Stretch: Attachments

If A-11 starts: files are untrusted, size and type are checked, storage is private, retrieval checks ownership, and no real photo is used as a fixture. No image or complaint text is sent to an external AI service.

## What a Successful Demo Shows

It shows that the software behaves as specified with fictional data. It does not show diagnostic accuracy, safety in a real emergency, staffing, hospital integration, or a health benefit.
