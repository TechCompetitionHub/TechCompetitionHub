import { useLocation } from 'react-router-dom';

export function RouteProgress() {
  const location = useLocation();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-16 z-30 h-0.5 overflow-hidden"
    >
      <div
        key={location.key}
        className="route-progress h-full origin-left bg-gradient-to-r from-brand-500 via-brand-200 to-accent-500"
      />
    </div>
  );
}
