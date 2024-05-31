import type { FC } from 'react';
import { Layout } from '../Layout';
import { AdminLogin } from './AdminLogin';

export const AdminRoute: FC = () => {
  return (
    <Layout>
      <AdminLogin />
    </Layout>
  );
};
