import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { useAppDispatch } from '../../app/store';
import { normalizeAuthResponse, setCredentials } from './authSlice';
import { useSsoCallbackMutation } from '../../app/apiSlice';
import BrandLogo from '../../components/BrandLogo';

const SsoCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [ssoCallback] = useSsoCallbackMutation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (!code || !state) {
      setError('Missing SSO authorization data. Return to login and try again.');
      return;
    }

    const complete = async () => {
      try {
        const result = await ssoCallback({ code, state }).unwrap();
        dispatch(setCredentials(normalizeAuthResponse(result)));
        navigate('/', { replace: true });
      } catch {
        setError('SSO sign-in failed. Your session may have expired or your account is not provisioned.');
      }
    };

    void complete();
  }, [searchParams, ssoCallback, dispatch, navigate]);

  if (error) {
    return (
      <div className="auth-page">
        <Result
          status="error"
          title="SSO Sign-in Failed"
          subTitle={error}
          extra={<Button type="primary" onClick={() => navigate('/login', { replace: true })}>Back to Login</Button>}
        />
      </div>
    );
  }

  return (
    <div className="auth-page auth-page--callback">
      <section className="auth-page-brand auth-page-brand--compact">
        <div className="auth-page-brand-inner">
          <BrandLogo variant="primary-white" height={160} className="auth-page-logo" />
        </div>
      </section>
      <section className="auth-page-panel auth-page-panel--center">
        <Spin size="large" />
        <span className="auth-page-callback-text">Completing company sign-in…</span>
      </section>
    </div>
  );
};

export default SsoCallbackPage;
