import { initializeApp } from 'firebase/app';
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  getAuth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyA3Bmx3Ey446YEdBWGUJPco4M3ElBmYnJA',
  appId: '1:7275165334:web:25dea3e96cfc0ce6c2f4b7',
  authDomain: 'mankai-972a4.firebaseapp.com',
  messagingSenderId: '7275165334',
  projectId: 'mankai-972a4',
  storageBucket: 'mankai-972a4.firebasestorage.app',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

// googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
// googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.addScope('openid');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
export const facebookProvider = new FacebookAuthProvider();

facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');
