// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home';
import Tours from './pages/Tours';
import TourDetail from './pages/TourDetail';
import Login from './pages/Login';
import Account from './pages/Account';
import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />{' '}
        <Route path="/tours" element={<Tours />} />
        <Route path="/tour/:slug" element={<TourDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/me" element={<Account />} />
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </Routes>
  );
}

export default App;
