# HTTP / FastAPI Adapter Stub

This directory is reserved for the future HTTP adapter implementing the backend ports against a FastAPI service backend.

## Extensibility Plan

To swap the current Supabase backend with a FastAPI (or any other HTTP/REST/RPC) backend:

1. Implement repositories under this directory conforming to the domain ports interfaces (`ArticleRepository`, `BookRepository`, etc.).
2. Implement HTTP `AuthGateway` and `StorageGateway`.
3. Add `fastapi` driver selection to the composition root in `backend/src/index.ts`.
4. Run the new adapter through the shared contract test suite (`backend/src/domain/ports/contracts.ts`) to verify full interchangeability.
5. Set `BACKEND_DRIVER=fastapi` and configure `BACKEND_API_URL` in the environment.
