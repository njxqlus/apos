<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Bun

This project uses bun instead of npm or other package managers. Command `bun dev` (dev server) is always running in background, you MUST NOT try to run this command.

## Deployment

The project will be deployed as SSG (pure client side), so you SHOULD NOT use any server-side features like API routes, server components, etc.

## Formatting and Linting

To format and lint files you SHOULD use bun run fix. Under the hood, this command uses prettier and eslint. You MUST NOT use bun run build to check for errors, because this is a long operation.

## Testing

This project doesn't use any testing framework, so you SHOULD NOT write any tests.

## Types

You SHOULD run `bun typecheck` to check for type errors. You SHOULD NOT suppress type errors where possible and reasonable.

## Commits

You SHOULD always use conventional commits.
