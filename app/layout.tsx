// /app/layout.tsx
import './_assets/globals.css';  // Ensure you have your global styles imported
import Header from './_components/Header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'black', color: 'white' }}>
        <Header />
        <div style={{ display: 'flex', flex: 1 }}>
          <main style={{ flex: 1, padding: '20px' }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
