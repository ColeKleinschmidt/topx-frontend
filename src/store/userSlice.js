import { createSlice } from "@reduxjs/toolkit";

const readStoredUser = () => {
    try {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error("Failed to read stored user", error);
        return null;
    }
};

const userSlice = createSlice({
    name: "user",
    initialState: {
        current: readStoredUser(),
    },
    reducers: {
        setUser(state, action) {
            state.current = action.payload || null;
        },
        clearUser(state) {
            state.current = null;
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
