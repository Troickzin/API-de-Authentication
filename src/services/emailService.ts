import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import dotenv from "dotenv"

dotenv.config()

// --------------------------------------------------------------------------------

const transporterGmail: nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --------------------------------------------------------------------------------

const transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> = transporterGmail

// --------------------------------------------------------------------------------

export const sendEmail = async (to: string, titulo: string, text: string, nome:string) => {
  const mailOptions = {
    from: 'V1zion TK Support <v1ziontk@gmail.com>',
    to,
    subject: "Teste de mensagem usando o gmail",
    html: `
      <!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro Concluído</title>
    <style>
        .body {
            font-family: Arial, sans-serif;
            background-color: #e6e6e6;
            margin: 0;
            padding: 20px 0px 20px 0px;
            weight: 100%;
            height: 100%;
        }
        .container {
            max-width: 600px;
            margin: 40px auto; /* Adicionado margin-top de 40px */
            padding: 20px;
            background: linear-gradient(178deg, rgba(255,255,255,1) 75%, rgba(250,246,252,1) 75%);
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333333;
        }
        .content {
            text-align: center;
            padding: 20px 0;
        }
        .content p {
            font-size: 16px;
            color: #555555;
            line-height: 1.5;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: #ffffff !important;
            background-color: #28a745; /* Verde para indicar sucesso */
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }

        .footer {
            text-align: center;
            padding-top: 20px;
            font-size: 14px;
            color: #999999;
        }
    </style>
</head>
<body>
<div class="body">
    <div class="container">
        <div class="header">
            <h1>Login Realizado com Sucesso!</h1>
        </div>
        <div class="content">
            <p>Olá, <strong>${nome}</strong></p>
            <p>Seu login foi realizado com sucesso em nossa plataforma.</p>
            <p>Se você reconhece essa atividade, não é necessário fazer nada. Caso contrário, recomendamos que você altere sua senha imediatamente para garantir a segurança da sua conta.</p>
            <a href="${process.env.FRONT_END_URL}/config" class="button">Acessar Configurações da Conta</a>
        </div>
        <div class="footer">
            <p>&copy; 2023 Sua Empresa. Todos os direitos reservados.</p>
        </div>
    </div>
</div>
</body>
</html>
    `
  };
  
  let message

  try {
    await transporter.sendMail(mailOptions).then(info => {
      console.log('Email enviado com sucesso');
      message = info
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    message = error
  }

  return message

};

// --------------------------------------------------------------------------------

export const emailVerificacaoConcluida = async (to: string, titulo: string, nome: string) => {
  const mailOptions = {
    from: 'V1zion TK',
    to,
    subject: titulo,
    html: `
      <!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro Concluído</title>
    <style>
        .body {
            font-family: Arial, sans-serif;
            background-color: #e6e6e6;
            margin: 0;
            padding: 20px 0px 0px 0px;
            weight: 100vw;
            height: 100vh;
        }
        .container {
            max-width: 600px;
            margin: 40px auto; /* Adicionado margin-top de 40px */
            padding: 20px;
            background: linear-gradient(178deg, rgba(255,255,255,1) 75%, rgba(250,246,252,1) 75%);
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333333;
        }
        .content {
            text-align: center;
            padding: 20px 0;
        }
        .content p {
            font-size: 16px;
            color: #555555;
            line-height: 1.5;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: #ffffff !important;
            background-color: #28a745; /* Verde para indicar sucesso */
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }

        .footer {
            text-align: center;
            padding-top: 20px;
            font-size: 14px;
            color: #999999;
        }
    </style>
</head>
<body>
<div class="body">
    <div class="container">
        <div class="header">
            <h1>Registro Concluído com Sucesso!</h1>
        </div>
        <div class="content">
            <p>Olá, <strong>${nome}</strong></p>
            <p>Seu registro foi concluído com sucesso! Agora você faz parte da nossa comunidade.</p>
            <p>Agradecemos por se juntar a nós. Se precisar de ajuda ou tiver alguma dúvida, não hesite em entrar em contato conosco.</p>
        </div>
        <div class="footer">
            <p>&copy; 2023 Sua Empresa. Todos os direitos reservados.</p>
        </div>
    </div>
</div>
</body>
</html>
    `
  };

  try {
    await transporter.sendMail(mailOptions).then(info => {
      return info
    })
    console.log('Email enviado com sucesso');
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return error
  }
};

// --------------------------------------------------------------------------------

export const emailDeVerificacao = async (to: string, titulo: string, token: string, nome: string) => {
  const mailOptions = {
    from: 'V1zion TK',
    to,
    subject: titulo,
    html: `
      <!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificação de Email</title>
    <style>
        .body {
            font-family: Arial, sans-serif;
            background-color: #e6e6e6;
            margin: 0;
            padding: 20px 0px 0px 0px;
            weight: 100vw;
            height: 100vh;
        }
        .container {
            max-width: 600px;
            margin: 40px auto 0 auto;
            padding: 20px;
            background: linear-gradient(178deg, rgba(255,255,255,1) 75%, rgba(250,246,252,1) 75%);
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333333;
        }
        .content {
            text-align: center;
            padding: 20px 0;
        }
        .content p {
            font-size: 16px;
            color: #555555;
            line-height: 1.5;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: #ffffff !important;
            background-color: #007BFF;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            font-size: 14px;
            color: #999999;
        }
    </style>
</head>
<body>
<div class="body">
    <div class="container">
        <div class="header">
            <h1>Verificação de Email</h1>
        </div>
        <div class="content">
            <p>Olá, <strong>${nome}</strong></p>
            <p>Obrigado por se cadastrar! Para completar seu cadastro, por favor utilize o token abaixo para verificar seu endereço de email:</p>
            <p><strong>Token de Verificação:<span style="color: #007BFF;">${token}</span></strong> </p>
            <p>Se você não solicitou este email, por favor ignore esta mensagem.</p>
        </div>
        <div class="footer">
            <p>&copy; 2023 Sua Empresa. Todos os direitos reservados.</p>
        </div>
    </div>
</div>
</body>
</html>
    `
  };

  try {
    await transporter.sendMail(mailOptions).then(info => {
      return info
    });
    console.log('Email enviado com sucesso');
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return error
  }
};

// --------------------------------------------------------------------------------