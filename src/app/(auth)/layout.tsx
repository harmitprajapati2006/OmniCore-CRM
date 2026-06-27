export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4">
      {children}
    </div>
  );
}
