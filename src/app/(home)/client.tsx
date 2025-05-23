'use client';

import { trpc } from '@/trpc/client';

export const PageClient = () => {
	const [data] = trpc.hello.useSuspenseQuery({
		text: 'Lorem ipsum sir amet dolor',
	});

	return <span>Client page says: {data.greeting}</span>;
};
