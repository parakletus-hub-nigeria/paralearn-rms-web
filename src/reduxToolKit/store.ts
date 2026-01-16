import {configureStore} from '@reduxjs/toolkit';
import userReducer from "./user/userSlice";
import setUpReducer from './setUp/setUpSlice';
export const store = configureStore({
    reducer: {
        user: userReducer,
        setUp: setUpReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;