import nodemailer from 'nodemailer';
import { generateTicketPdf } from './pdfService.js';

// Transporter SMTP singleton
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Fonction générique d'envoi de mail.
 * @param {{ to: string, subject: string, html: string, attachments?: object[] }} options
 */
export async function sendMail({ to, subject, html, attachments = [] }) {
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
    attachments,
  });
}

/**
 * Envoie un mail de bienvenue après l'inscription.
 * @param {{ name: string, email: string }} user
 */
export async function sendWelcomeEmail(user) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #1a1a2e; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">RIFLE EVENTS</h1>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #1a1a2e;">Bienvenue, ${user.name} !</h2>
        <p>Votre compte a été créé avec succès. Vous pouvez dès maintenant découvrir et réserver des événements près de chez vous.</p>
        <p style="margin-top: 24px;">À bientôt sur Rifle Events !</p>
      </div>
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center;">
        <p style="color: #888; font-size: 12px; margin: 0;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      </div>
    </div>
  `;

  return sendMail({
    to: user.email,
    subject: `Bienvenue sur Rifle Events, ${user.name} !`,
    html,
  });
}

/**
 * Envoie un mail de confirmation d'achat avec le billet PDF en pièce jointe.
 * @param {{ name: string, email: string }} user
 * @param {object} ticket - ticket Prisma avec relation event incluse
 */
export async function sendTicketEmail(user, ticket) {
  const pdfBuffer = await generateTicketPdf(user, ticket);

  const eventDate = new Date(ticket.event.date).toLocaleString('fr-FR');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #1a1a2e; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">RIFLE EVENTS</h1>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #1a1a2e;">Votre billet est confirmé !</h2>
        <p>Bonjour ${user.name},</p>
        <p>Votre achat a bien été enregistré. Retrouvez votre billet en pièce jointe de cet email.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr style="background: #f5f5f5;">
            <td style="padding: 10px 12px; color: #555; font-size: 13px;">Événement</td>
            <td style="padding: 10px 12px; font-weight: bold;">${ticket.event.title}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; color: #555; font-size: 13px;">Date</td>
            <td style="padding: 10px 12px;">${eventDate}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 10px 12px; color: #555; font-size: 13px;">Lieu</td>
            <td style="padding: 10px 12px;">${ticket.event.location}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; color: #555; font-size: 13px;">Numéro de billet</td>
            <td style="padding: 10px 12px; font-family: monospace;">${ticket.id}</td>
          </tr>
        </table>
        <p>Présentez le QR code figurant sur votre billet à l'entrée de l'événement.</p>
      </div>
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center;">
        <p style="color: #888; font-size: 12px; margin: 0;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      </div>
    </div>
  `;

  return sendMail({
    to: user.email,
    subject: `Votre billet – ${ticket.event.title}`,
    html,
    attachments: [
      {
        filename: `billet-${ticket.id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}
