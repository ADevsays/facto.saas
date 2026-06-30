import nodemailer from 'nodemailer';
import 'dotenv/config';
import fs from 'fs';

const htmlTemplate = fs.readFileSync('d:/Proyectos/factos/.agents/skills/facto-email-design/assets/template.html', 'utf-8');

const messageContent = `
<h2 style="margin: 0 0 20px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 400; color: #FFFFFF;">
  ¡Hola, Fundador de Xin!
</h2>

<p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #D1D5DB; font-weight: 300;">
  Te escribimos de parte del equipo de Facto para avisarte que el enlace del sitio web registrado para tu startup (<strong>Xin</strong>) parece no estar funcionando en este momento.
</p>

<p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.6; color: #D1D5DB; font-weight: 300;">
  Para mantener tu proyecto visible en la comunidad, te invitamos a actualizar la URL. Si el enlace no se corrige pronto, el perfil podría ser ocultado temporalmente del directorio para cuidar la experiencia de los visitantes.
</p>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center">
      <a href="https://factosaas.com/saas/xin" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 8px; color: #00D4FF; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">
        Ir al perfil de Xin
      </a>
    </td>
  </tr>
</table>
`;

const finalHtml = htmlTemplate.replace(/<!-- INICIO CONTENIDO DINÁMICO -->[\s\S]*<!-- FIN CONTENIDO DINÁMICO -->/, `<!-- INICIO CONTENIDO DINÁMICO -->\n${messageContent}\n<!-- FIN CONTENIDO DINÁMICO -->`);

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.BREVO_PORT) || 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  },
  tls: {
    rejectUnauthorized: true,
    checkServerIdentity: () => undefined
  },
  logger: false,
  debug: false
});

async function send() {
  try {
    const info = await transporter.sendMail({
      from: '"Facto" <oficial@adevsays.com>',
      to: 'xin@support.com',
      subject: 'Aviso sobre el enlace web de Xin',
      html: finalHtml
    });
    console.log('Correo enviado con éxito a Xin!', info.messageId);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
}

send();
