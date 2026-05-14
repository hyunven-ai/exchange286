// Root admin layout — minimal, no auth check.
// Login page lives here directly.
// Protected admin pages live in (protected)/ group which has its own layout with auth.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
