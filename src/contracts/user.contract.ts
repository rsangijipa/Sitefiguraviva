import { z } from 'zod';

export const UserSchema = z.object({
    uid: z.string(),
    email: z.string().email().optional(),
    displayName: z.string().optional(),
    photoURL: z.string().url().optional(),
    role: z.enum(['admin', 'student', 'tutor', 'guest']).default('student'),
    createdAt: z.string().or(z.date()).optional(),
});

export type User = z.infer<typeof UserSchema>;
