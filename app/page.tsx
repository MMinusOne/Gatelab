'use client';

import dynamic from 'next/dynamic';

// 1. IMPORT YOUR COMPONENT
// We use 'dynamic' and 'ssr: false' because Canvas cannot run on the server.
// It effectively says: "Wait until the browser is open to load this."
const CanvasEditor = dynamic(() => import('./components/CanvasEditor'), {
  ssr: false,
});

export default function Home() {
  return (
    <main style={{ padding: '0px', fontFamily: 'sans-serif' }}>
      <CanvasEditor />
      
    </main>
  );
}