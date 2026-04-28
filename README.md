# AI Sales Page Generator (Option B)

Monorepo structure:

- `backend/` Laravel API
- `frontend/` React + Vite web app

## Quick Start

### 1) Backend

```powershell
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Backend runs at `http://127.0.0.1:8000`.

### 2) Frontend

Open a new terminal:

```powershell
cd frontend
copy .env.example .env
npm install --cache .npm-cache
npm run dev
```

Frontend runs at `http://127.0.0.1:5173`.

## Demo Account

- Email: `demo.review@dakwah.test`
- Password: `Password123!`

## Backend API Design (Current)

- All application API routes are centralized in: `backend/routes/api.php`
- No `Route::apiResource(...)`; all routes are explicit.
- Request validation is inline in controller methods.
- Query logic is centralized in models using Query Builder.
- API response format is standardized via `BaseApiController`:

```json
{
  "status": 200,
  "message": "...",
  "data": {}
}
```

## Active API Endpoints

Public:

- `POST /api/register`
- `POST /api/login`

Protected (`auth:sanctum`):

- `POST /api/logout`
- `GET /api/sales-pages`
- `GET /api/sales-pages/{id}`
- `POST /api/sales-pages`
- `PUT /api/sales-pages/{id}`
- `DELETE /api/sales-pages/{id}`
- `GET /api/gemini-account`
- `PUT /api/gemini-account`

## Gemini Settings

Gemini credentials are stored per user in `gemini_accounts`.

When user registers, app auto-creates default gemini account values:

- `api_key`: from `GEMINI_API_KEY` in backend env
- `model`: from `GEMINI_MODEL` in backend env
- `rpm`: `5`
- `rpd`: `20`
- `tpm`: `250000`
- `last_quota_synced_at`: `null`

Gemini model is read-only from frontend. To change model, edit DB directly.

## Environment Variables

`backend/.env`:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash
```

> Note: There is no fallback generator. If Gemini fails, backend returns a human-readable error.

## Frontend Pages

- `/` Workspace (generate, history, open/download variants)
- `/architecture` Architecture summary page
- `/settings/gemini` Gemini credential & quota page

## Notes

- `vendor/` is Composer dependency source code (framework/packages), not your app source.
- `frontend/.npm-cache/`, `node_modules/`, and build artifacts should remain ignored by git.
