import type { LoginLINEDto } from '#/api/requests';
import axios from 'axios';

const API_URL =
  import.meta.env.VITE_MODE === 'dev'
    ? import.meta.env.VITE_API_URL_DEV
    : import.meta.env.VITE_MODE === 'staging'
      ? import.meta.env.VITE_API_URL_STAGING
      : import.meta.env.VITE_API_URL_PRO;

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  referredUserCode?: string;
}

interface ConfirmRegisterPayload {
  email: string;
  verifyCode: string;
}

interface ConfirmResetPass {
  email: string;
  verifyCode: string;
  password: string;
}

export const authService = {
  confirmRegister: async ({ email, verifyCode }: ConfirmRegisterPayload) => {
    const response = await axios.post(`${API_URL}auth/confirm-register`, {
      email,
      verifyCode,
    });
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const res = await axios.post(`${API_URL}auth/forgot-password`, { email });
    return res.data;
  },

  login: async ({ email, password }: LoginPayload) => {
    const response = await axios.post(`${API_URL}auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  loginFacebook: async (accessToken: string) => {
    const response = await axios.post(`${API_URL}auth/login-facebook`, {
      accessToken,
    });
    return response.data;
  },

  loginGoogle: async (idToken: string, fullName: string) => {
    const response = await axios.post(`${API_URL}auth/login-google`, {
      fullName,
      idToken,
    });
    return response.data;
  },

  loginWithLINE: async (doc: LoginLINEDto) => {
    const response = await axios.post(`${API_URL}auth/login-line`, doc);
    return response.data;
  },

  register: async (payload: RegisterPayload) => {
    const response = await axios.post(`${API_URL}auth/register`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  resetPassword: async ({ email, verifyCode, password }: ConfirmResetPass) => {
    const response = await axios.post(`${API_URL}auth/reset-password`, {
      email,
      password,
      verifyCode,
    });
    return response.data;
  },
};
