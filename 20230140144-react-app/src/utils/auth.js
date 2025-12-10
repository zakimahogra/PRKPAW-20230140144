import {jwtDecode} from 'jwt-decode';

export const getToken = () => {
  return localStorage.getItem('token');
};

export const decodeToken = () => {
  const token = getToken();
  if (token) {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  return null;
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const isAdmin = () => {
  const user = decodeToken();
  return user && user.role === 'admin';
};