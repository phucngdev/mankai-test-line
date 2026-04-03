import { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { useAppDispatch } from '#/shared/redux/store';
import { resetDataClass } from '#/shared/redux/slices/ClassSlice';
import { resetDataSession } from '#/shared/redux/slices/SessionSlice';
import { resetDataLession } from '../redux/slices/LessionSlice';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

export const useResetDataOnLogout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [user, setUser] = useState(() => {
    try {
      const userStr = Cookies.get('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  });
  const hasResetRef = useRef(false);
  const previousUserRef = useRef(user);
  const prevUserStateRef = useRef(user);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const userStr = Cookies.get('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        const previousUser = previousUserRef.current;

        const currentUserStr = JSON.stringify(currentUser);
        const previousUserStr = JSON.stringify(previousUser);

        if (currentUserStr !== previousUserStr) {
          previousUserRef.current = currentUser;
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error parsing user cookie:', error);

        if (previousUserRef.current !== null) {
          previousUserRef.current = null;
          setUser(null);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const prevUser = prevUserStateRef.current;
    const hadUser = prevUser !== null;
    const hasUser = user !== null;

    if (hadUser && !hasUser && !hasResetRef.current) {
      hasResetRef.current = true;

      dispatch(resetDataClass());
      dispatch(resetDataSession());
      dispatch(resetDataLession());

      message.info('Hết phiên đăng nhập, vui lòng đăng nhập lại.');
      navigate('/');
    } else if (hasUser) {
      hasResetRef.current = false;
    }

    prevUserStateRef.current = user;
  }, [user, navigate, dispatch]);

  return user;
};
