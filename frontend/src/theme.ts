import { extendTheme } from "@chakra-ui/react";

const colors = {
  brand: {
    50: "#f5f7ff",
    100: "#e6eefc",
    200: "#caddfa",
    300: "#a9c6f4",
    400: "#85aef0",
    500: "#5f96ec",
    600: "#4b79d1",
    700: "#3556a7",
    800: "#243a6e",
    900: "#121c36",
  },
};

const fonts = {
  heading: `Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial`,
  body: `Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial`,
};

export const theme = extendTheme({
  colors,
  fonts,
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.800",
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "brand",
      },
    },
  },
});

export default theme;
