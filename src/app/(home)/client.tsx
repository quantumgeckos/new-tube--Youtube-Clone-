'use client';

import { trpc } from '@/trpc/client';
import { HydrateClient } from '@/trpc/server';
import { Suspense } from 'react';
// import { ErrorBoundary } from 'react-error-boundary';

export const PageClient = () => {
	const [data] = trpc.hello.useSuspenseQuery({
		text: 'Lorem ipsum sir amet dolor',
	});

	return <span>Client page says: {data.greeting}</span>;
};
