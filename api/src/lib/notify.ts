import nodemailer from 'nodemailer';
import { env } from '../env.js';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!env.SMTP_HOST || !env.SMTP_PORT) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
  });
  return transporter;
}

export interface LeadNotification {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  requestType: string;
  projectType?: string | null;
  approxBudget?: string | null;
  message?: string | null;
  sourcePage?: string | null;
}

export async function notifyNewLead(lead: LeadNotification): Promise<void> {
  const t = getTransporter();
  if (!t || !env.LEAD_NOTIFY_TO || !env.SMTP_FROM) return;

  const lines = [
    `New lead — ${lead.requestType}`,
    '',
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    lead.phone ? `Phone: ${lead.phone}` : null,
    lead.company ? `Company: ${lead.company}` : null,
    lead.projectType ? `Project: ${lead.projectType}` : null,
    lead.approxBudget ? `Budget: ${lead.approxBudget}` : null,
    lead.sourcePage ? `From: ${lead.sourcePage}` : null,
    '',
    lead.message ? `Message:\n${lead.message}` : null,
  ].filter(Boolean);

  await t.sendMail({
    from: env.SMTP_FROM,
    to: env.LEAD_NOTIFY_TO,
    subject: `[turki] new ${lead.requestType} — ${lead.name}`,
    text: lines.join('\n'),
  });
}
