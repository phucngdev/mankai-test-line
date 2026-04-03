import DetailCourse from '../components/DetailCourse/DetailCourse';
import DetailMockTest from '../components/DetailMockTest/DetailMockTest';
import DetailTopic from '../components/DetailTopic/DetailTopic';
import ListCourse from '../components/ListCourse/ListCourse';
import ListMockTest from '../components/ListMockTest/ListMockTest';
import ListTopic from '../components/ListTopic/ListTopic';
import MockTestExam from '../components/MockTestExam/MockTestExam';
import GlobalVocabulary from '../components/Vocabulary/GlobalVocabulary/GlobalVocabulary';
import VocabularyElementary from '../components/Vocabulary/VocabularyElementary/VocabularyElementary';
import DefaultLayout from '../layouts/DefaultLayout/DefaultLayout';
import DictionaryPage from '../pages/Dictionary/DictionaryPage';
import Home from '../pages/Home/Home';

import DownLoadApp from '#/shared/components/notfound/DownLoadApp';
import { NotFound } from '#/shared/components/notfound/NotFound';
import { Navigate } from 'react-router-dom';
import ForgotPass from '../components/Auth/ForgotPass';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import Auth from '../pages/Auth/Auth';

import CallbackLINEPage from '#/src/pages/CallbackLINE/CallbackLINEPage';
import Forum from '#/src/pages/Forum/Forum';
import ExamResultDetail from '../pages/ListTestExam/ExamResultDetail';
import ListExam from '../pages/ListTestExam/ListExam';
import Profile from '../pages/Profile/Profile';
import LineCallback from '#/features/line-callback/pages/LinePageCallBack';
import FacebookCallBack from '#/features/line-callback/pages/FacebookCallBack';

const routesConfig = [
  {
    children: [
      {
        element: <Navigate replace to="login" />,
        path: '',
      },
      {
        element: <Login />,
        path: 'login',
      },
      {
        element: <Register />,
        path: 'register',
      },
      {
        element: <ForgotPass />,
        path: 'forgot-password',
      },
    ],
    element: <Auth />,
    path: '/auth',
  },
  {
    path: '/line/callback',
    element: <LineCallback />,
  },
  {
    path: '/facebook/callback',
    element: <FacebookCallBack />,
  },
  {
    element: <GlobalVocabulary />,
    path: 'vocabulary/:courseId/:id/:lessonId',
  },
  {
    element: <MockTestExam />,
    path: 'mock-test-exam/:id',
  },
  {
    children: [
      {
        element: <Home />,
        index: true,
        path: '/',
      },
      // {
      //   element: <Class />,
      //   path: '/class',
      // },
      {
        element: <ListExam />,
        path: '/list-exam',
      },
      {
        element: <Profile />,
        path: '/profile',
      },
      {
        element: <ListCourse />,
        path: 'list-course',
      },
      {
        element: <Forum />,
        path: 'forum',
      },
      {
        element: <DetailCourse />,
        path: 'detail-course/:id',
      },
      {
        element: <ExamResultDetail />,
        path: 'exam-result/:id',
      },
      {
        element: <VocabularyElementary />,
        path: 'Vocabulary-Elementary',
      },
      {
        element: <ListTopic />,
        path: 'list-topic',
      },
      {
        element: <ListMockTest />,
        path: 'mock-test',
      },
      {
        element: <DetailMockTest />,
        path: 'detail-mock-test/:id',
      },
      {
        element: <DetailTopic />,
        path: 'detail-topic/:id',
      },
      {
        element: <DictionaryPage />,
        path: 'dictionary',
      },
      {
        element: <CallbackLINEPage />,
        path: 'line/callback',
      },
      // {
      //   element: <PrivateRouter />,
      //   children: [],
      // },
    ],
    element: <DefaultLayout />,
    path: '/',
  },
  {
    element: <NotFound />,
    path: '*',
  },
  {
    element: <DownLoadApp />,
    path: 'down-app',
  },
];
export default routesConfig;
