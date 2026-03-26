import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

/**
 * Génère un PDF billet pour un ticket donné.
 * @param {object} user  - { name, email }
 * @param {object} ticket - ticket Prisma avec relation event incluse
 * @returns {Promise<Buffer>}
 */
export async function generateTicketPdf(user, ticket) {
  const qrDataUrl = await QRCode.toDataURL(ticket.qrCode);
  const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A5', margin: 40 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // --- En-tête ---
    doc.fontSize(22).font('Helvetica-Bold').text('RIFLE EVENTS', { align: 'center' });
    doc.moveDown(0.4);
    doc.fontSize(13).font('Helvetica').fillColor('#555555').text("Billet d'entrée", { align: 'center' });
    doc.fillColor('#000000');
    doc.moveDown(0.6);
    doc.moveTo(40, doc.y).lineTo(515, doc.y).strokeColor('#cccccc').stroke();
    doc.moveDown(0.8);

    // --- Informations événement ---
    doc.fontSize(17).font('Helvetica-Bold').fillColor('#1a1a2e').text(ticket.event.title);
    doc.moveDown(0.4);
    doc.fontSize(11).font('Helvetica').fillColor('#333333');
    doc.text(`Date : ${new Date(ticket.event.date).toLocaleString('fr-FR')}`);
    doc.text(`Lieu : ${ticket.event.location}`);
    if (ticket.event.price !== undefined) {
      doc.text(`Prix : ${ticket.event.price} €`);
    }
    doc.moveDown(0.8);

    // --- Informations billet ---
    doc.moveTo(40, doc.y).lineTo(515, doc.y).strokeColor('#cccccc').stroke();
    doc.moveDown(0.6);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a1a2e').text('Informations du billet');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica').fillColor('#333333');
    doc.text(`Numéro : ${ticket.id}`);
    doc.text(`Titulaire : ${user.name}`);
    doc.text(`Statut : ${ticket.status}`);
    doc.text(`Date d'achat : ${new Date(ticket.purchaseDate).toLocaleString('fr-FR')}`);
    doc.moveDown(1);

    // --- QR Code ---
    const qrX = (doc.page.width - 120) / 2;
    doc.image(qrBuffer, qrX, doc.y, { width: 120, height: 120 });
    doc.moveDown(9);
    doc.fontSize(9).fillColor('#888888').text("Présentez ce QR code à l'entrée de l'événement", { align: 'center' });

    doc.end();
  });
}
