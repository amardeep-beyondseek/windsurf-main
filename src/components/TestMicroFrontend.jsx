import React, { lazy, Suspense } from 'react';

// Try to load the Dashboard micro frontend directly
const Dashboard = lazy(() => import('microfrontends/Dashboard'));

const TestMicroFrontend = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Testing Micro Frontend Loading</h2>
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
        <Suspense fallback={<div>Loading Dashboard...</div>}>
          <Dashboard />
        </Suspense>
      </div>
    </div>
  );
};

export default TestMicroFrontend;
