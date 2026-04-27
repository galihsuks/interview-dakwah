# Frontend - AI Sales Page Generator

Frontend ini sudah di-refactor dengan stack modern dan struktur modular untuk memudahkan review teknis.

## Tech Stack
- React + TypeScript
- Tailwind CSS v4
- TanStack React Query
- Axios
- React Router DOM
- Zustand
- Lucide React

## Run
```powershell
npm install --cache .npm-cache
copy .env.example .env
npm run dev
```

Default API base URL ada di `.env`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Build & Lint
```powershell
npm run lint
npm run build
```

## Folder Structure
- `src/api`: axios client + endpoint functions
- `src/interfaces`: seluruh TypeScript interfaces/types
- `src/hooks`: React Query hooks (`useQuery`/`useMutation`)
- `src/store`: Zustand store (auth session)
- `src/pages`: page-level components (`/auth`, `/`, `/architecture`)
- `src/components`: reusable UI/domain components
- `src/utils`: helpers (parser, export utils)
- `src/app`: router + provider composition

## Flow Singkat
1. User login/register di `/auth`.
2. Token disimpan di Zustand persist (`localStorage`).
3. Axios interceptor menyisipkan Bearer token.
4. Dashboard memakai React Query untuk CRUD sales pages.
5. Saat generate, backend menghasilkan 4 referensi `plain_html` (full HTML document) dari Gemini/fallback.
6. Live preview menampilkan ringkasan input + tombol membuka setiap referensi di tab baru (`_blank`).
7. Global toast + skeleton loading membantu feedback UX saat query/mutation berjalan.
