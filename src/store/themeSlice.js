import { createSlice } from "@reduxjs/toolkit";

const readStoredTheme = () => {
    try {
        const stored = localStorage.getItem("theme");
        return stored === "dark" ? "dark" : "light";
    } catch (error) {
        console.error("Failed to read stored theme", error);
        return "light";
    }
};

const themeSlice = createSlice({
    name: "theme",
    initialState: {
        mode: readStoredTheme(),
    },
    reducers: {
        setTheme(state, action) {
            state.mode = action.payload === "dark" ? "dark" : "light";
        },
        toggleTheme(state) {
            state.mode = state.mode === "dark" ? "light" : "dark";
        },
    },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
