import { createSlice } from "@reduxjs/toolkit";

const blockedUsersSlice = createSlice({
    name: "blockedUsers",
    initialState: {
        items: [],
    },
    reducers: {
        setBlockedUsers(state, action) {
            state.items = action.payload || [];
        },
    },
});

export const { setBlockedUsers } = blockedUsersSlice.actions;
export default blockedUsersSlice.reducer;
