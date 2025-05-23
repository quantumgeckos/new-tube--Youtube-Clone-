
import { z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import { TRPCError } from '@trpc/server';

export const appRouter = createTRPCRouter({
    /* hello component */
    hello: protectedProcedure
        .input(
            z.object({
                text: z.string(),
            }),
        )
        .query((opts) => {
            
            return {
                greeting: `hello ${opts.input.text}`,
            };
        }),

    /* New component goes below */
});
// export type definition of API
export type AppRouter = typeof appRouter;