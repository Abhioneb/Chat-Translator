import { NextPage } from 'next';
import { useSession, signIn } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/chat'); // 👈 redirect to chat
    }
  }, [status, router]);

  if (status === 'loading') {
    return <p className="flex items-center justify-center h-screen">Loading…</p>;
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <button
          onClick={() => signIn()}
          className="px-6 py-3 bg-purple-600 text-white rounded-full shadow hover:bg-purple-700 transition"
        >
          Sign In to Easy Chat
        </button>
      </div>
    );
  }

  return null; // 👈 you’ll never see this, because authenticated users get redirected
};

export default Home;
