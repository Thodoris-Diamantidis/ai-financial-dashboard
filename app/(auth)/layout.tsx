// app/(auth)/layout.tsx
export const dynamic = "force-dynamic"; // ← important
("use client"); // optional if you want client behavior

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
