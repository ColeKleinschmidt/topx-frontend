import { configureStore } from "@reduxjs/toolkit";
import notificationsReducer from "./notificationsSlice.js";
import blockedUsersReducer from "./blockedUsersSlice.js";
import userReducer from "./userSlice.js";
import themeReducer from "./themeSlice.js";

export const store = configureStore({
    reducer: {
        notifications: notificationsReducer,
        blockedUsers: blockedUsersReducer,
        user: userReducer,
        theme: themeReducer,
    },
});
