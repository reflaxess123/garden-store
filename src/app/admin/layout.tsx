export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <h2>Admin Area Layout</h2>
      {children}
    </div>
  );
}
