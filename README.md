# Welcome to your app

## Getting started

### Install dependencies

```shell script
npm install
```

### Spin up the development server

```shell script
npm run dev
```

Your app will be reachable at `http://localhost:9029`

## Tests

This codebase comes with a set of unit tests and integration tests covering about 70% of statements coverage.

### Run tests

#### With coverage

```shell script
npm run test
```

You will get a recap with coverage for each file.

#### With watcher

```shell script
npm run test:watch
```

### Helpers

In order to tests Next.js API routes, we've made available a `callNowHandler` helper function in `jest/helpers.ts`.  
Make sure you pass the HTTP method, headers, query or cookie as the second parameter like the example below.

```typescript
import { callNowHandler } from "../../jest/helpers";
import someHandler from "../pages/api/some-handler";

describe("/api/some-handler", () => {
    test("responds 200 to authenticated GET", async () => {
        const response = await callNowHandler(someHandler, {
            method: "GET",
            headers: { Authorization: "Bearer token" }
        });

        expect(response.status).toBe(200);
    });
});
```
