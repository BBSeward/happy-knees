import PoseDetectionPage from "./_components/OpenPoseStreamer";
import { createTheme, MantineProvider } from "@mantine/core";

// core styles are required for all packages
import "@mantine/core/styles.css";

// other css files are required only if
// you are using components from the corresponding package
// import '@mantine/dates/styles.css';
// import '@mantine/dropzone/styles.css';
// import '@mantine/code-highlight/styles.css';
// ...

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

export default function HomePage() {
  return (
    <MantineProvider theme={theme}>
      <div>Home page</div>
    </MantineProvider>
  );
}
