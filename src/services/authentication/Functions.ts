import { generateToken } from "../tokenServices";
import Usuario from '../../models/usuarioModel';
import bcrypt from "bcrypt";
import cloudinary from "cloudinary"
import dotenv from "dotenv"
import { TokensdeRegistros } from "../../context/TokensContext";

// --------------------------------------------------------------------------------

import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { s3Client } from "../../config/s3";
import { emailVerificacaoConcluida } from "../emailService";
import { returnMessages } from "../returnMessages";

// --------------------------------------------------------------------------------

dotenv.config()

// Talvez eu utilize ele para salvar imagens de perfil 🤔

// cloudinary.v2.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// --------------------------------------------------------------------------------

const setTokens = async (userData:any) => {

  const accessToken = await generateToken(userData, "access");
  const refreshToken = await generateToken(userData, "refresh");

  return { accessToken, refreshToken }

}

// --------------------------------------------------------------------------------

const setCookies = async (res:any, token:any) => {

  const { accessToken, refreshToken } = await setTokens(token)


  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "None", maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "None", maxAge: 15 * 60 * 1000 });

  return { accessToken, refreshToken }

}

// --------------------------------------------------------------------------------

const criptografarSenha = async (senha: string) : Promise<string> => {
  
  if (!senha) throw new Error("Senha é obrigatória");
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(senha, salt);

}

// --------------------------------------------------------------------------------

const descriptografarSenha = async (senha: string, senhaCriptgrafada: string) : Promise<boolean> => {

  return await bcrypt.compare(senha, senhaCriptgrafada)

}

// --------------------------------------------------------------------------------

const bucketName = "v1ziontk";

const salvarFotoPerfil = async (dadosUsuario:any) => {

  const imagem_perfil = dadosUsuario.foto_perfil
  const apelido = dadosUsuario.apelido

  const base64Data = imagem_perfil.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(base64Data, "base64");

  const contentType = imagem_perfil.startsWith("data:image/png") ? "image/png" : "image/jpeg";

    const fileName = `perfil-${apelido}`;

    const uploadParams = {
      Bucket: bucketName,
      Key: `Perfil/${apelido}/${fileName}`,
      Body: imageBuffer,
      ContentType: contentType,
    };

    const upload = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    await upload.done();

    return `https://${bucketName}.s3.us-east-1.amazonaws.com/Perfil/${apelido}/${fileName}`;

  // const imagemSalva = await cloudinary.v2.uploader.upload(imagem_perfil, {

  //   folder: 'Imagem de Perfil',
  //   public_id: `user_profile_${dadosUsuario.nome.toLowerCase().replace(/ /g, "_")}`,

  // }).catch((error) => {

  //   console.log(error);
  //   throw new Error("Erro ao fazer upload da imagem");

  // });

  // return imagemSalva.secure_url

}

// --------------------------------------------------------------------------------

const googleScript = async (res:any, data:any) => {

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
      </head>
      <body>
        <h1 id="titulo">Logando com o google</h1>
        <script src="/public/script.js" data="${encodeURIComponent(JSON.stringify(data))}" frontEnd="${process.env.FRONT_END_URL}"></script>
      </body>
    </html>
  `);

}

// --------------------------------------------------------------------------------

interface tokenValidacaoProps {
  token:string,
  verify:boolean,
  data?: object | {},
  createdAt: number
}

interface dadosRegistro {
  nome: string,
  apelido: string,
  senha: string,
  email: string,
  foto_perfil: string
}

const tokenValidacao = async (dadosUsuario?: dadosRegistro) : Promise<tokenValidacaoProps> => {

  const generateRandomString = (length: number = 8) : string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      if (i === 8 || i === 14) {
        result += '-';
      }
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const newToken:tokenValidacaoProps = {
    token: generateRandomString(8),
    verify: false,
    data: dadosUsuario,
    createdAt: Date.now()
  };

  TokensdeRegistros.push(newToken);  

  return newToken

}

// --------------------------------------------------------------------------------

const ValidarComToken = async (Token:any, Tempo_em_Minuto:number = 0.2) => {

  const TokenID = Token.token
  const TokenData = Token.data

  const timeoutId = setTimeout(() => {

    TokensdeRegistros.splice(TokensdeRegistros.findIndex(token => token.token === TokenID), 1);

  }, Tempo_em_Minuto * 60 * 1000);
    
  const verificarToken = () => {

    const tokenEncontrado = TokensdeRegistros.find(t => t.token === TokenID);

    if (tokenEncontrado && tokenEncontrado.verify) {

      clearTimeout(timeoutId);
      TokensdeRegistros.splice(TokensdeRegistros.findIndex(t => t.token === TokenID), 1);

    }

  };
  
  const observarAlteracaoToken = () => {

    const intervalId = setInterval(() => {

      const tokenEncontrado = TokensdeRegistros.find(t => t.token === TokenID);

      if (tokenEncontrado && tokenEncontrado.verify) {

        clearInterval(intervalId);

        verificarToken();

      }

    }, 1000);

  };
  
  observarAlteracaoToken();
  
}

const registrar = async (dadosUsuario:any, res:any) => {

  try {

    const UsuarioExistente = await Usuario.findOne({ "dados.email": dadosUsuario.email });

    if (UsuarioExistente) {
      return res.status(401).json({ message: returnMessages.erro.email_registrado });
    }

    const senhaCriptgrafada = await criptografarSenha(dadosUsuario.senha);

    const imagemSalva = await salvarFotoPerfil(dadosUsuario);

    const novoUsuario = new Usuario({
      perfil: {
        nome: dadosUsuario.nome,
        apelido: dadosUsuario.apelido.toLowerCase(),
        imagem_perfil: imagemSalva
      },
      dados: {
        email: dadosUsuario.email,
        senha: senhaCriptgrafada
      }
    });

    await novoUsuario.save();

    await setCookies(res, {
      perfil: {
        nome: novoUsuario.perfil.nome,
        apelido: novoUsuario.perfil.apelido,
        foto_perfil: novoUsuario.perfil.imagem_perfil
      },
      dados: {
        email: novoUsuario.dados.email,
        tipo: novoUsuario.dados.tipo
      }
    });

    await emailVerificacaoConcluida(dadosUsuario.email, "Registro Concluído", dadosUsuario.nome);

    const { senha, ...dadosRestantes } = novoUsuario.dados;
    const dadosSemSenha = { 
      dados: { ...dadosRestantes }, 
      ...novoUsuario.perfil 
    };
    
    return res.status(201).json({
      message: `${returnMessages.sucesso.logado}, ${dadosUsuario.nome}`,
      Dados: dadosSemSenha
    });

  } catch (err) {
    console.error("❌ Erro ao registrar usuário:", err);
    return res.status(500).json({ message: returnMessages.erro.erro_servidor, error: err });
  }
};

// --------------------------------------------------------------------------------

export { setCookies, setTokens, criptografarSenha, salvarFotoPerfil, descriptografarSenha, googleScript, tokenValidacao, ValidarComToken, registrar }

// Nao sei quando e nem como, mas eu comecei a usar emojis nos logs.....