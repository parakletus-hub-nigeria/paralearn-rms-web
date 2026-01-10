'use client';
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { get } from "http";

interface UserState {
    accessToken: string | null,
    user:{
        id:string,
        email:string,
        firstName:string,
        lastName:string,
        schoolId:string,
        roles: string[]
    }

}

const getInitialToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

const initialState: UserState = {
    accessToken: getInitialToken() || null,
    user: {
        id: "",
        email: "",
        firstName: "",
        lastName: "",
        schoolId: "",
        roles: []
    }

}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers:{
        updateUserData: (state, action) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', action.payload.accessToken);
      }
      console.log("User data updated in store:", state.accessToken);
        },
        logout : (state) => {
            state.accessToken = null
           if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
        }
    },
})


export const {updateUserData } = userSlice.actions;
const userReducer=userSlice.reducer
export default userReducer