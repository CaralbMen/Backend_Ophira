const nodemailer = require('nodemailer');

// Configurar el transporter. El usuario debe tener las variables de entorno configuradas
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const enviarCodigoRecuperacion = async (correo, codigo) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: correo,
            subject: 'Código de Recuperación - Ophira QR',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0;">Ophira QR</h1>
                        <p style="margin: 5px 0 0 0;">Sistema de Gestión de Activos</p>
                    </div>
                    <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333; margin-bottom: 20px;">Recuperación de Contraseña</h2>
                        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                            Recibimos una solicitud para recuperar tu contraseña. Usa el siguiente código en los próximos 15 minutos:
                        </p>
                        <div style="background: #f5f5f5; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                            <p style="font-size: 12px; color: #999; margin: 0 0 10px 0;">Código de Recuperación:</p>
                            <p style="font-size: 36px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 5px;">${codigo}</p>
                        </div>
                        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                            <strong>⏱️ Este código expira en 15 minutos.</strong> Si no solicitaste este código, puedes ignorar este correo.
                        </p>
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                            © 2026 Ophira System | Sistema de Gestión de Activos
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error al enviar correo:', error);
        throw error;
    }
};

module.exports = {
    enviarCodigoRecuperacion
};
