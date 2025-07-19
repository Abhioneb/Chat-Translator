import { NextPage } from 'next';
import { useSession, signIn, signOut } from 'next-auth/react';

const Home: NextPage = () => {
  const { data: session, status } = useSession();

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {session.user?.name || session.user?.email}!
      </h1>
      <p className="mb-6 text-gray-600">You’re now signed in to Easy Chat.</p>
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Home;