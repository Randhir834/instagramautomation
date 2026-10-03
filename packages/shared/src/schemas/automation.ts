import { z } from 'zod';

export const triggerTypeSchema = z.enum(['COMMENT', 'DM_KEYWORD', 'STORY_REPLY']);
export const matchTypeSchema = z.enum(['CONTAINS', 'EXACT']);
export const stepTypeSchema = z.enum([
  'SEND_MESSAGE',
  'QUICK_REPLIES',
  'FOLLOW_GATE',
  'COLLECT_EMAIL',
  'COLLECT_PHONE',
]);

/** Instagram rejects messages over 1000 bytes; stay safely under it. */
const messageText = z.string().trim().min(1, 'Write a message').max(900);

// ----- Payload of each step type -----

export const sendMessagePayloadSchema = z.object({ text: messageText });

export const quickRepliesPayloadSchema = z.object({
  text: messageText,
  /** Instagram shows at most 13 buttons and cuts titles at 20 characters. */
  buttons: z
    .array(z.object({ title: z.string().trim().min(1).max(20) }))
    .min(1, 'Add at least one button')
    .max(10),
});

export const followGatePayloadSchema = z.object({
  promptText: messageText,
  buttonTitle: z.string().trim().min(1).max(20).default('I followed'),
  notFollowingText: messageText.default(
    "It looks like you're not following yet. Follow and tap the button again.",
  ),
});

export const collectInputPayloadSchema = z.object({
  promptText: messageText,
  retryText: messageText.default("That doesn't look right. Could you send it again?"),
});

export const STEP_PAYLOAD_SCHEMAS = {
  SEND_MESSAGE: sendMessagePayloadSchema,
  QUICK_REPLIES: quickRepliesPayloadSchema,
  FOLLOW_GATE: followGatePayloadSchema,
  COLLECT_EMAIL: collectInputPayloadSchema,
  COLLECT_PHONE: collectInputPayloadSchema,
} as const;

export type SendMessagePayload = z.infer<typeof sendMessagePayloadSchema>;
export type QuickRepliesPayload = z.infer<typeof quickRepliesPayloadSchema>;
export type FollowGatePayload = z.infer<typeof followGatePayloadSchema>;
export type CollectInputPayload = z.infer<typeof collectInputPayloadSchema>;

// ----- Steps and automations -----

export const automationStepSchema = z
  .object({
    type: stepTypeSchema,
    payload: z.record(z.unknown()).default({}),
  })
  .superRefine((step, ctx) => {
    const result = STEP_PAYLOAD_SCHEMAS[step.type].safeParse(step.payload);
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({ ...issue, path: ['payload', ...issue.path] });
      }
    }
  })
  .transform((step) => ({
    type: step.type,
    // Re-parse so defaults (button title, retry text) are filled in.
    payload: STEP_PAYLOAD_SCHEMAS[step.type].parse(step.payload) as Record<string, unknown>,
  }));

// No defaults here: an update must never overwrite a field that was not sent.
const automationFields = {
  name: z.string().trim().min(1, 'Give it a name').max(100),
  isActive: z.boolean(),
  triggerType: triggerTypeSchema,
  /** null = applies to all posts */
  postId: z.string().min(1).nullable(),
  keywords: z.array(z.string().trim().min(1).max(50)).min(1, 'Add at least one keyword').max(20),
  matchType: matchTypeSchema,
  /** One is picked at random for each comment. */
  publicReplies: z.array(z.string().trim().min(1).max(300)).max(10),
  /** Run in order. The first one is sent as the DM. */
  steps: z.array(automationStepSchema).min(1, 'Add the message to send').max(10),
};

export const createAutomationSchema = z.object({
  igAccountId: z.string().min(1, 'Pick an Instagram account'),
  ...automationFields,
  isActive: automationFields.isActive.default(true),
  triggerType: automationFields.triggerType.default('COMMENT'),
  postId: automationFields.postId.default(null),
  matchType: automationFields.matchType.default('CONTAINS'),
  publicReplies: automationFields.publicReplies.default([]),
});

export const updateAutomationSchema = z.object(automationFields).partial();

export type TriggerType = z.infer<typeof triggerTypeSchema>;
export type MatchType = z.infer<typeof matchTypeSchema>;
export type StepType = z.infer<typeof stepTypeSchema>;
export type AutomationStepInput = z.infer<typeof automationStepSchema>;
export type CreateAutomationInput = z.infer<typeof createAutomationSchema>;
/** What a form submits, before defaults are applied. */
export type CreateAutomationFormValues = z.input<typeof createAutomationSchema>;
export type UpdateAutomationInput = z.infer<typeof updateAutomationSchema>;
