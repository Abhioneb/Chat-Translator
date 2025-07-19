// src/pages/auth/signin.tsx
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { getProviders, signIn, ClientSafeProvider } from 'next-auth/react';

interface SignInProps {
    providers: Record<string, ClientSafeProvider>;
}
  
export default function SignIn({ providers }: SignInProps) {
  return (
    <>
      <Head>
        <title>Sign in • Easy Chat</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 px-4">
        <div className="relative max-w-md w-full bg-white/30 backdrop-blur-md rounded-3xl shadow-xl p-8">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
            {/* <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-md">
              <img src="/logo.png" alt="Easy Chat Logo" className="h-12 w-12" />
            </div> */}
          </div>
          <div className="mt-12 space-y-6">
            <h1 className="text-center text-2xl font-bold text-white drop-shadow-lg">
              Welcome to Easy Chat
            </h1>
            <p className="text-center text-white/80">Real-time, multilingual conversations</p>
            <div className="space-y-4">
              {Object.values(providers).map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                  className="w-full flex items-center justify-center py-3 px-5 bg-white hover:bg-white/90 rounded-xl shadow hover:shadow-lg transition"
                >
                  <span className="text-gray-800 font-medium">
                    Sign in with {provider.name}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-white/70">
              We use OAuth to authenticate—your credentials stay with the provider.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<SignInProps> = async () => {
  const providers = await getProviders();
  return { props: { providers: providers ?? {} } };
};
