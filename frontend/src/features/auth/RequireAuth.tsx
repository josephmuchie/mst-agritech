import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/store';


interface RequireAuthProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles }) => {
  const { accessToken, user } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !user.roles.some((r) => allowedRoles.includes(r))) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default RequireAuth;
