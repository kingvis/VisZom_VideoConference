'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';

import { tokenProvider } from '@/actions/stream.actions';
import Loader from '@/components/Loader';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const [error, setError] = useState<string | null>(null);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (!API_KEY) {
      setError('Stream API key is missing from environment variables.');
      return;
    }

    try {
      const client = new StreamVideoClient({
        apiKey: API_KEY,
        user: {
          id: user?.id,
          name: user?.username || user?.id,
          image: user?.imageUrl,
        },
        tokenProvider,
      });

      setVideoClient(client);
    } catch (err: any) {
      console.error('Error creating StreamVideoClient', err);
      setError(`Failed to create video client: ${err?.message || err}`);
    }
  }, [user, isLoaded]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-white bg-dark-2">
        <div className="p-4 bg-red-900 rounded border border-red-500">
          <h2 className="font-bold text-lg mb-2">Configuration Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) return <Loader />; // Still loading auth state
  if (!user) return <Loader />; // Authenticated but no user? Should redirect.

  if (!videoClient) return <Loader />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
