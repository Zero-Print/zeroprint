import {z} from "zod";

export const createSubscriptionSchema = z.object({
  planId: z.enum(["citizen", "school", "msme"]),
  autoRenewal: z.boolean().optional(),
});

export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1),
  reason: z.string().optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;


