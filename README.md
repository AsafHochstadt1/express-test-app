# node-cicd-demo

A tiny Express app built purely as a sandbox for learning two things in GitHub:

1. **CI/CD pipelines** (`.github/workflows/ci.yml`)
2. **Reusable "functions" in GitHub Actions** — both flavors:
   - a **composite action** (step-level function)
   - a **reusable workflow** (workflow-level function)

## The app

- `GET /health` → `{ "status": "ok" }`
- `GET /calc?op=add&a=2&b=3` → `{ "result": 5 }` (also supports `subtract`, `multiply`)

Run it locally:

```bash
npm install
npm start
# visit http://localhost:3000/health
```

Test it:

```bash
npm test
```

Lint it:

```bash
npm run lint
```

## Project layout

```
.
├── src/
│   ├── app.js              # Express app + routes
│   └── math.js              # plain functions the app + tests use
├── test/
│   └── app.test.js          # Jest + Supertest tests
├── .github/
│   ├── actions/
│   │   └── setup-project/
│   │       └── action.yml   # composite action ("function" #1)
│   └── workflows/
│       ├── ci.yml           # main pipeline, calls both functions below
│       └── reusable-test.yml # reusable workflow ("function" #2)
```

## How the pipeline is wired together

`ci.yml` has four jobs that run in order: `lint` → `test` → `build` → `deploy`.

```
lint  →  test (matrix: Node 18 & 20)  →  build  →  deploy (main branch only)
```

- **CI** happens on every push and pull request: lint + test catch problems
  before code reaches `main`.
- **CD** happens only when code lands on `main` (a real `push`, not a PR):
  the `deploy` job is gated with
  `if: github.ref == 'refs/heads/main' && github.event_name == 'push'`.
  Right now it just echoes a message — swap that step for a real deploy
  (Render, Fly.io, a VM, an S3 sync, whatever you want to practice with).

## The two kinds of "function"

GitHub Actions gives you two ways to avoid repeating yourself, and this repo
uses both on purpose so you can see the difference.

### 1. Composite action — `.github/actions/setup-project/action.yml`

This is the step-level function: a named bundle of steps (checkout, install
Node, `npm ci`) that any job can call with a single line:

```yaml
- name: Setup project
  uses: ./.github/actions/setup-project
  with:
    node-version: '20'
```

`node-version` is its "parameter" (declared under `inputs:` in the action
file, with a default of `20`). Every job in `ci.yml` calls this instead of
repeating the checkout/setup-node/npm-ci steps four times.

### 2. Reusable workflow — `.github/workflows/reusable-test.yml`

This is the workflow-level function. It declares `on: workflow_call` instead
of `on: push`, which means it never runs on its own — only when another
workflow calls it:

```yaml
test:
  needs: lint
  strategy:
    matrix:
      node-version: ['18', '20']
  uses: ./.github/workflows/reusable-test.yml
  with:
    node-version: ${{ matrix.node-version }}
```

It takes an input (`node-version`) and produces an output (`test-result`),
just like a real function taking arguments and returning a value. `ci.yml`
calls it once per entry in the matrix, so your tests run against Node 18
*and* 20 without duplicating the test job.

**Rule of thumb:** reach for a composite action when you're repeating a
handful of *steps* inside jobs; reach for a reusable workflow when you're
repeating a whole *job* (or want a shared workflow multiple repos can call).

## Things to try next

- Add a second composite action, e.g. one that runs `npm audit`.
- Add more matrix entries (Node 22, different OSes) to `reusable-test.yml`.
- Add a `workflow_dispatch` trigger to `ci.yml` so you can run it manually
  from the Actions tab.
- Replace the `deploy` placeholder with an actual deployment target and add
  a repository secret for its credentials (`secrets.MY_TOKEN`).
- Break a test on purpose and push it to a branch — open a PR and watch the
  `lint`/`test` jobs fail before you're even allowed to merge.
