import { Request, Response } from 'express';
import Usuario from '../models/usuarioModel';
import { descriptografarSenha, googleScript, tokenValidacao, ValidarComToken, registrar, setCookies } from '../services/authentication/Functions';
import { emailDeVerificacao, sendEmail } from '../services/emailService';
import { returnMessages } from '../services/returnMessages';

// --------------------------------------------------------------------------------

import { TokensdeRegistros } from '../context/TokensContext';

// --------------------------------------------------------------------------------

interface dadosLogin {
  senha: string,
  email: string
}

const signIn = async (req:Request, res:Response): Promise<any> => {

  const dadosUsuario:dadosLogin = req.body;
  if (!dadosUsuario) return res.status(400).json({message: returnMessages.erro.dados_invalidos});

  try {

    const usuario = await Usuario.findOne({ "dados.email" : dadosUsuario.email });
    if (!usuario) return res.status(401).json({message: returnMessages.erro.usuario_nao_encontrado})

    const senhaCorreta = await descriptografarSenha(dadosUsuario.senha, usuario.dados.senha)
    if (!senhaCorreta) return res.status(401).json({message: returnMessages.erro.senha_incorreta})

    const Dados = {
      perfil:{nome: usuario.perfil.nome, apelido: usuario.perfil.apelido, foto_perfil: usuario.perfil.imagem_perfil}, 
      dados:{email: usuario.dados.email, tipo: usuario.dados.tipo}
   }
    await setCookies(res, Dados)
    await sendEmail(dadosUsuario.email, "Conta logada", "Conta logada no V1ZION TK", usuario.perfil.nome)
    res.status(201).json({message: returnMessages.sucesso.logado, Dados})

  } catch (err) {

    console.log(err)
    return res.status(500).json({message: returnMessages.erro.erro_servidor, error: err})

  }

};

// --------------------------------------------------------------------------------

interface dadosRegistro {
  nome: string,
  apelido: string,
  senha: string,
  email: string,
  foto_perfil: string
}

const signUp = async (req: Request, res: Response): Promise<any> => {

  console.log("🚀 Iniciando registro...");

  let dadosUsuario: dadosRegistro = req.body;
  console.log("📝 Dados recebidos:", dadosUsuario);
  if (!dadosUsuario.email) {console.log("❌ Erro: Email não fornecido."); return res.status(400).json({ message: returnMessages.erro.dados_invalidos });}

  const UsuarioExistente = await Usuario.findOne({ "dados.email": dadosUsuario.email });
  if (UsuarioExistente) {console.log("❌ Email já registrado."); return res.status(401).json({ message: returnMessages.erro.email_registrado });}

  try {

    const validacaoToken = await tokenValidacao(dadosUsuario);

    await emailDeVerificacao(dadosUsuario.email, "Verificação de E-mail", validacaoToken.token, dadosUsuario.nome);

    ValidarComToken(validacaoToken as any, 10)

    return res.status(201).json({ message: "pre-registro feito, por favor valide para que o registro seja concluido" });

  } catch (err) {

    console.error("❌ Erro ao validar token:", err);
    return res.status(401).json({ message: "Erro ao validar token por email" });

  }

};


// --------------------------------------------------------------------------------

const signOut = (req:Request, res:Response): any => {

  req.logout((err: any) => {
    
    if(err) {
      return res.status(500).json({ message: "Erro ao deslogar", error: err.message });
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({ message: `Deslogado com sucesso` });

  })

}

// --------------------------------------------------------------------------------

const googleSignIn = async (req:any, res:any) => {

  const frontData = req.authInfo?.frontUser;
  const profile = req.authInfo?.profile;

  if (!req.user) {
    
    if (!frontData) {

      console.log(returnMessages.google.necessario_vincular)
      const data = { message: returnMessages.google.necessario_vincular, requer_vinculacao: true, logado: false };
      return await googleScript(res, data);

    }

    try {
    
      let usuario = await Usuario.findOne({ "dados.email": frontData.dados.email });
      let googleLink = await Usuario.findOne({ 'dados.google.id': profile.id });

      if (!usuario) return res.status(404).json({ message: "Usuário do front não encontrado" });
      
      if (usuario.dados.google?.id) {  

        console.log(returnMessages.google.usuario_ja_vinculado)
        const data = { message: returnMessages.google.usuario_ja_vinculado, requer_vinculacao: false, logado: false };
        return await googleScript(res, data);

      }

      if (googleLink) {

        console.log(returnMessages.google.google_ja_vinculado) 
        const data = { message: returnMessages.google.google_ja_vinculado, requer_vinculacao: false, logado: false };
        
        return await googleScript(res, data)

      }

      usuario.dados.google = {id: String(profile.id), email: profile.emails[0].value}
      await usuario.save();

      const { accessToken } = await setCookies(res, { id: usuario.id, name: usuario.perfil.nome })
      
      const data = { message:"vinculado com sucesso",requer_vinculacao: false, logado: true, userInfo: {perfil:{nome: usuario.perfil.nome, apelido: usuario.perfil.apelido, foto_perfil: usuario.perfil.imagem_perfil}, dados:{email: usuario.dados.email, tipo: usuario.dados.tipo, google: {id: usuario.dados.google.id, email: usuario.dados.google.email}} }, accessToken };
            
      console.log(data.userInfo.dados.google)

      return await googleScript(res, data)

    } catch (err:any) {

      console.error(err.message);
      return res.status(500).json({ message: returnMessages.erro.erro_servidor });

    }

  }

  if (frontData) return

  try {

    const user = req.user;

    const { accessToken } = await setCookies(res, { id: user.id, nome: user.perfil.nome })
    const data = { requer_vinculacao: false, logado: true, userInfo: {perfil:{nome: user.perfil.nome, apelido: user.perfil.apelido, foto_perfil: user.perfil.imagem_perfil}, dados:{email: user.dados.email, tipo: user.dados.tipo, google: {id:user.dados.google.id, email:user.dados.google.email}} }, accessToken };

    return await googleScript(res, data)

  } catch (err:any) {

    console.error(err.message);
    return res.status(500).json({ message: returnMessages.erro.erro_servidor });

  }
};

// --------------------------------------------------------------------------------

const verifyRegister = async (req:any, res:any) => {

  const { id } = req.params;

  const tokenIndex = TokensdeRegistros.findIndex(token => token.token === id);

  console.log("TokensdeRegistros:",TokensdeRegistros)
  if (tokenIndex !== -1) {

    const token = TokensdeRegistros[tokenIndex]

    
    if (token.data) {
      
      token.verify = true;
      console.log("Token verificado:", token);
      await registrar(token.data, res);
      return;

    } else {

        return res.status(400).json({ message: "Dados do token são inválidos ou inexistentes." });

    }

  } else {

    return res.status(404).json({
      message: `Token not found`
    });

  }

};
 
// --------------------------------------------------------------------------------

export default { signIn, signUp, signOut, googleSignIn, verifyRegister };