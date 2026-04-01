const nodemailer = require('nodemailer');

// Configurar el transporter. El usuario debe tener las variables de entorno configuradas
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const enviarConReintentos = async (mailOptions, intentos = 3) => {
    let ultimoError = null;

    for (let intento = 1; intento <= intentos; intento += 1) {
        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            ultimoError = error;
            console.error(`Error al enviar correo (intento ${intento}/${intentos}):`, error);
            if (intento < intentos) {
                await esperar(1000 * intento);
            }
        }
    }

    throw ultimoError;
};

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

        await enviarConReintentos(mailOptions);
        return true;
    } catch (error) {
        console.error('Error al enviar correo:', error);
        throw error;
    }
};

const enviarNotificacionCambioPassword = async (correo, nombreUsuario = '', nuevaPassword = '') => {
    try {
        const saludo = nombreUsuario ? `Hola ${nombreUsuario},` : 'Hola,';
        const bloquePassword = nuevaPassword
            ? `
                <div style="background: #f5f5f5; border: 1px solid #d4d4d4; border-radius: 8px; padding: 14px; margin: 14px 0;">
                    <p style="font-size: 12px; color: #666; margin: 0 0 6px 0;">Nueva contraseña temporal:</p>
                    <p style="font-size: 20px; font-weight: bold; color: #111; margin: 0; letter-spacing: 1px;">${nuevaPassword}</p>
                </div>
            `
            : '';

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: correo,
            subject: 'Tu contraseña fue actualizada - Ophira QR',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0;">Ophira QR</h1>
                        <p style="margin: 5px 0 0 0;">Sistema de Gestión de Activos</p>
                    </div>
                    <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333; margin-bottom: 20px;">Aviso de Seguridad</h2>
                        <p style="color: #666; line-height: 1.6; margin-bottom: 16px;">
                            ${saludo}
                        </p>
                        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                            Te notificamos que tu contraseña en Ophira QR fue actualizada recientemente.
                        </p>
                        ${bloquePassword}
                        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                            Si no reconoces este cambio, ponte en contacto con el administrador del sistema de inmediato.
                        </p>
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                            © 2026 Ophira System | Sistema de Gestión de Activos
                        </p>
                    </div>
                </div>
            `
        };

        await enviarConReintentos(mailOptions);
        return true;
    } catch (error) {
        console.error('Error al enviar correo de cambio de contraseña:', error);
        throw error;
    }
};

module.exports = {
    enviarCodigoRecuperacion,
    enviarNotificacionCambioPassword
};
