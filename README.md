# AI Sales Page Generator (Option B)

Monorepo structure:
- `backend/` Laravel API (Sanctum token auth + Sales Page generator)
- `frontend/` React + Vite web app

## Quick Start

### 1) Backend
```powershell
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
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

## API Environment
In `backend/.env` (optional, for real AI generation):

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash
```

If no Gemini key is set, the API uses a local fallback template generator.

## Core Features Implemented
- API auth: register, login, logout (Bearer token)
- Product input form data
- AI/fallback sales-page generation
- Saved pages history: list, search, edit/regenerate, delete
- Live preview (iframe)
- Export generated output to `.txt` and `.html`
