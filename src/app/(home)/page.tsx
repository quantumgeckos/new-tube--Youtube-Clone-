import { HydrateClient, trpc } from '@/trpc/server';
import { PageClient } from './client';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';

export default async function Home() {
	void trpc.hello.prefetch({ text: 'Lorem ipsum sir amet dolor' });

	return (
		<div>
			<HydrateClient>
				<Suspense fallback={<p>Loading...</p>}>
					<ErrorBoundary fallback={<p>Error</p>}>
						<PageClient />
					</ErrorBoundary>
				</Suspense>
			</HydrateClient>
		</div>
	);
}
