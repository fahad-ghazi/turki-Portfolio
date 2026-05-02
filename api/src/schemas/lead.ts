import { z } from 'zod';

const requestType = z.enum(['meeting', 'call', 'quote', 'collaboration', 'job_opportunity']);

export const leadCreateSchema = z.object({
  name: z.string().min(2).max(120).trim(),
  email: z.string().email().max(180).trim(),
  phone: z.string().max(40).optional().nullable(),
  company: z.string().max(120).optional().nullable(),
  request_type: requestType.default('meeting'),
  project_type: z.string().max(120).optional().nullable(),
  approx_budget: z.string().max(60).optional().nullable(),
  preferred_time: z.string().max(80).optional().nullable(),
  message: z.string().max(4000).optional().nullable(),
  source: z.string().max(200).optional().nullable(),
  source_page: z.string().max(200).optional().nullable(),
  // Honeypot — must be empty. Real users never see this field.
  website: z.string().max(0).optional(),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
