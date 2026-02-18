// app/(auth)/layout.tsx
export const dynamic = "force-dynamic"; // ← important

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
