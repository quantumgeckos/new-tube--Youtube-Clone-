import { db } from '@/db';
import { users } from '@/db/schema';
import { WebhookEvent } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

export async function POST(req: Request) {
	const CLERK_SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET;

	if (!CLERK_SIGNING_SECRET) {
		throw new Error('Error: Please add CLERK_SIGNING_SECRET from clerk dashboard to .env or .env.local');
	}

	/* new svix instance with secret */
	const wh = new Webhook(CLERK_SIGNING_SECRET);

	/* Get Headers */
	const headerPayload = await headers();
	const svix_id = headerPayload.get('svix_id');
	const svix_timestamp = headerPayload.get('svix_timestamp');
	const svix_signature = headerPayload.get('svix_signature');

	/* If there's no headers, error out */
	if (!svix_id || !svix_signature || !svix_timestamp) {
		return new Response('Error: missing Svix headers', {
			status: 400,
		});
	}

	/* Get Body */
	const payload = await req.json();
	const body = JSON.stringify(payload);

	let evt: WebhookEvent;

	/* verify payload with headers */
	try {
		evt = wh.verify(body, {
			svix_id: svix_id,
			svix_timestamp: svix_timestamp,
			svix_signature: svix_signature,
		}) as WebhookEvent;
	} catch (err) {
		console.error('Error: Could not verify webhooks:', err);
		return new Response('Error: verification error', {
			status: 400,
		});
	}

	/*  Do someting with the payload 
        demo will log payload to the console 
    */
	const eventType = evt.type;

	if (eventType === 'user.created') {
		const { data } = evt;
		await db.insert(users).values({
			clerkId: data.id,
			name: `${data.first_name} ${data.last_name}`,
			imageUrl: data.image_url,
		});
	}

	if (eventType === 'user.deleted') {
		const { data } = evt;
		if (!data.id) {
			return new Response('Missing user id', { status: 400 });
		}
		await db.delete(users).where(eq(users.clerkId, data.id));
	}

	if (eventType === 'user.updated') {
		const { data } = evt;
		await db.update(users).set({
			name: `${data.first_name} ${data.last_name}`,
			imageUrl: data.image_url,
		}).where(eq(users.clerkId, data.id));
	}

	return new Response('Wenhook received', { status: 200 });
}
