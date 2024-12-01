// /app/layout.tsx
import "./_assets/globals.css";
import Navbar from "./_components/Navbar";
import { createTheme, MantineProvider } from "@mantine/core";

const theme = createTheme({
  colorScheme: 'dark', // Set the color scheme to dark to apply a consistent theme
  primaryColor: "blue", // Primary color for buttons and highlights
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
  components: {
    // Customize all TextInput components
    TextInput: {
      styles: {
        input: {
          backgroundColor: '#2C2E33', // Dark gray background
          color: 'white', // White text color
          borderRadius: '8px',
          padding: '12px',
          fontSize: '16px',
          border: '1px solid #444', // Light border to separate input from background
          '&:focus': {
            borderColor: '#888', // Lighter border color on focus
          },
        },
      },
    },
    // Customize all Textarea components
    Textarea: {
      styles: {
        input: {
          backgroundColor: '#2C2E33', // Dark gray background
          color: 'white', // White text color
          borderRadius: '8px',
          padding: '12px',
          fontSize: '16px',
          border: '1px solid #444', // Light border to separate input from background
          '&:focus': {
            borderColor: '#888', // Lighter border color on focus
          },
        },
      },
    },
    // Customize all NumberInput components
    NumberInput: {
      styles: {
        input: {
          backgroundColor: '#2C2E33', // Dark gray background
          color: 'white', // White text color
          borderRadius: '8px',
          padding: '12px',
          fontSize: '16px',
          border: '1px solid #444', // Light border to separate input from background
          '&:focus': {
            borderColor: '#888', // Lighter border color on focus
          },
        },
      },
    },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
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

        {/* Wrap the app in MantineProvider to apply the theme */}
        <MantineProvider theme={theme}>
          <div
            style={{
              display: "flex",
              flex: 1,
              paddingTop: `20px`,
            }}
          >
            <main
              style={{
                flex: 1,
                paddingTop: "60px",
                paddingLeft: "20px",
                paddingRight: "20px",
              }}
            >
              {children}
            </main>
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}
