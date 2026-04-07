/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: "#0F4C75",   // medical blue
                background: "#F8FAFC",
                "background-light": "#F8FAFC",
                "background-dark": "#0F172A",
                card: "#FFFFFF",
                accent: "#22C55E",
            },
        },
    },
    plugins: [],
}
