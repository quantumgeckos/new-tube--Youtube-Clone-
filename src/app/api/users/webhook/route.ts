import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export const POST = async (req: Request) => {
    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    if (!SIGNING_SECRET) {
        throw new Error(`CLERK SIGNING_SECRET is not set in the .env !`)
    }

    const wh = new Webhook(SIGNING_SECRET)

    const headerPayload = await headers();
    const svix_id = headerPayload.get(`svix-id`);
    const svix_timestamp = headerPayload.get(`svix-timestamp`);
    const svix_signature = headerPayload.get(`svix-signature`);
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response(`Error: Missing svix headers`, {
            status: 400
        })
    }
    // console.log(`//===========header==========//`, headerPayload);

    const payload = await req.json();
    const body = JSON.stringify(payload);

    /* Verify body with the header */
    let evt: WebhookEvent;
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error: Could not verify webhooks:', err);
        return new Response('Error: verification error', {
            status: 400,
        });
    }

    const eventType = evt.type;

    /* On user create */
    if (eventType === 'user.created') {
        const { data } = evt;
        await db
            .insert(users)
            .values({
                clerkId: data.id,
                name: `${data.first_name} ${data.last_name}`,
                imageUrl: data.image_url,
            });
    }
    /* On user update */
    if (eventType === 'user.updated') {
        const { data } = evt;

        await db
            .update(users)
            .set({
                name: `${data.first_name} ${data.last_name}`,
                imageUrl: data.image_url,
            })
            .where(eq(users.clerkId, data.id));
    }

    /* On user delete */
    if (eventType === 'user.deleted') {
        const { data } = evt;
        if (!data.id) {
            return new Response(`Missing local user id`, { status: 400 })
        };
        await db.delete(users).where(eq(users.clerkId, data.id));
    }



    return new Response(`Database Successfully Updated`, { status: 200 })
}
