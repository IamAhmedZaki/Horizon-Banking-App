'use server';

import { cookies } from "next/headers";
import { apiClient } from "../appwrite";

export const signUp = async (userData: SignUpParams) => {
  try {
    const response = await apiClient.post('/auth/sign-up', userData);

    // Store the JWT token in a cookie — same concept as the old appwrite-session cookie
    // httpOnly means JavaScript can't access it, protecting against XSS attacks
    cookies().set('horizon-token', response.token, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days matching our JWT expiry
    });

    return response.user;
  } catch (error) {
    console.error('SignUp error:', error);
  }
}

export const signIn = async ({ email, password }: signInProps) => {
  try {
    const response = await apiClient.post('/auth/sign-in', { email, password });

    // Same as above — store token in httpOnly cookie
    cookies().set('horizon-token', response.token, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response.user;
  } catch (error) {
    console.error('SignIn error:', error);
  }
}

export const getLoggedInUser = async () => {
  try {
    // Read the token from the cookie and send it to the backend
    const token = cookies().get('horizon-token')?.value;
    if (!token) return null;

    const user = await apiClient.get('/auth/me', token);
    return user;
  } catch (error) {
    console.error('GetLoggedInUser error:', error);
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    // JWT is stateless so we just delete the cookie — no backend call needed
    cookies().delete('horizon-token');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return null;
  }
}