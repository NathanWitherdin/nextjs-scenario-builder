# Evidence Pack — Assessment 2

## Run Instructions

```bash
npm install
npm run dev
```

or

```bash
docker build -t courtroom .
docker run -p 3000:3000 courtroom
```

## Environment

- Framework: Next.js 14 (App Router)
- Database: Prisma + SQLite
- Runtime: Node.js 18+
- Testing: Playwright
- Container: Docker (multi-stage build)

## API Routes

| Method | Route               | Purpose         |
| ------ | ------------------- | --------------- |
| POST   | /api/scenarios      | Create scenario |
| GET    | /api/scenarios      | List scenarios  |
| GET    | /api/scenarios/[id] | Fetch scenario  |
| PUT    | /api/scenarios/[id] | Update scenario |
| DELETE | /api/scenarios/[id] | Delete scenario |

## Testing

Run Playwright tests:

```bash
npx playwright test
```

Included tests:

- `generate-code-output.spec.ts`
- `preview-ignores-critical.spec.ts`

## Docker

```bash
docker build -t courtroom .
docker run -p 3000:3000 courtroom
```

## Performance Evidence

Include screenshots:

- `lighthouse.png`
- `jmeter.png`
- `app-screens.png`
- `git-history.png`

## Feedback Notes

- Friend 1:
- Friend 2:
- Family:
- Industry mentor:

## Deployment & Lambda

- Cloud URL:
- Lambda URL:

## Demo Video

File: `/evidence/demo.mp4`
