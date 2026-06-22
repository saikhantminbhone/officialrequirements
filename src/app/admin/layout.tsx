// The admin console moved to /ops. This layout just passes through; the pages
// below redirect to their /ops equivalents.
export default function AdminLegacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
