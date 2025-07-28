/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx,css}",  // ✅ include all TSX/JSX/CSS files
    ],
    theme: {
        extend: {
            colors: {
                txtPrimary: "#555",
                txtLight: "#999",
                txtDark: "#333",
                bgPrimary: "#f1f1f1",
            }
        },
    },
    plugins: [],
};
