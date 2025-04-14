import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';


export default function Success() {
  const router = useRouter();
  const [refreshed, setRefreshed] = useState(false);

useEffect(() => {
  const refresh = async () => {
    if (router.query.session_id && !refreshed) {
      setRefreshed(true);
      await signIn('credentials', { redirect: false }); 
      router.replace(router.pathname); 
    }
  };
  refresh();
}, [router.query.session_id, refreshed]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>✅ Mokėjimas sėkmingas!</h1>
      <p>Kreditai turėtų būti atnaujinti. Ačiū!</p>
    </div>
  );
}
