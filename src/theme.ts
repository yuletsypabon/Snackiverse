"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    cssVariables: true,
    palette: {
        mode: "light",
        primary: {
            main: "#183149",
            dark: "#132331",
            light: "#31475f",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#2ecc71",
            dark: "#27ae60",
            contrastText: "#ffffff",
        },
        background: {
            default: "#edf2f8",
            paper: "#ffffff",
        },
        text: {
            primary: "#0a2540",
            secondary: "#5f6f7d",
        },
    },
    shape: {
        borderRadius: 10,
    },
    typography: {
        fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
        h1: {
            fontWeight: 900,
        },
        h2: {
            fontWeight: 900,
        },
        h3: {
            fontWeight: 900,
        },
        button: {
            fontWeight: 900,
            textTransform: "none",
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    boxShadow: "none",
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                rounded: {
                    borderRadius: 16,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    color: "#5f6f7d",
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                },
            },
        },
    },
});

export default theme;
