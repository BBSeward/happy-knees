// /app/layout.tsx
import "./_assets/globals.css";
import Navbar from "./_components/Navbar";
import { createTheme, MantineProvider } from "@mantine/core";

const theme = createTheme({
  // colorScheme: 'dark', // Dark mode base
  primaryColor: "blue", // You can change this to your preferred primary color
  black: "#000000", // Explicit black for dark mode
  white: "#ffffff", // Explicit white for contrast
  colors: {
    dark: [
      "#C1C2C5", // Lighter shade for text
      "#A6A7AB",
      "#909296",
      "#5c5f66",
      "#373A40",
      "#2C2E33", // Default background
      "#25262B",
      "#1A1B1E", // Darker background
      "#141517",
      "#101113",
    ],
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // <MantineProvider theme={theme}>
      <html lang="en">
        <body
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            backgroundColor: "black",
            color: "white",
          }}
        >
          <Navbar />
          <div style={{ display: "flex", flex: 1 }}>
            <main style={{ flex: 1 }}>{children}</main>
          </div>
        </body>
      </html>
    // </MantineProvider>
  );
}
