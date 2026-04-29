import { AppSidebarLayout } from '../../components/common/AppSidebarLayout';

const architectureSections = [
  {
    title: 'Routing Layer',
    points: ['React Router DOM with `AuthGuard`', 'Separation between `/auth`, `/`, `/architecture`, and `/settings/gemini`'],
  },
  {
    title: 'Data Fetching',
    points: ['Axios instance + Bearer interceptor', 'TanStack Query for caching, mutation, and invalidation'],
  },
  {
    title: 'State Management',
    points: ['Zustand persist store for auth session', 'Toast store for global feedback notifications'],
  },
  {
    title: 'Scalable Structure',
    points: ['`api/`, `hooks/`, `interfaces/`, `store/`, `pages/`, `components/`', 'Clear domain boundaries to improve maintainability'],
  },
  {
    title: 'UX & Delivery',
    points: ['Tailwind CSS utility-driven styling', 'Skeleton state + success/error/info toast for clear feedback'],
  },
];

export function ArchitecturePage() {
  return (
    <AppSidebarLayout title="Architecture" subtitle="Technical overview of the project structure and flow.">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {architectureSections.map((section) => (
          <article key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">{section.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {section.points.map((point) => (
                <li key={point} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </AppSidebarLayout>
  );
}
