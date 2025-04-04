import Usuario from "../models/usuarioModel";
import { decodeToken } from "../services/tokenServices";

interface tokenDados {
  dados: {email:string, tipo:string},
  iat:number,
  exp:number
}

async function adminMiddleware(req:any, res:any, next:any) {

  const accessToken = req.cookies.accessToken;
  const decodedToken = await decodeToken(accessToken);
  
  if (!decodedToken) {return res.status(401).json({ message: "Usuario não está logado" });}

  const tokenVerificado: tokenDados = decodedToken as tokenDados;
  const usuario = await Usuario.findOne({"dados.email": tokenVerificado.dados.email})

  if (usuario?.dados.tipo == "admin") {
    
    console.log(`Acesso permitido ao admin ${usuario.perfil.apelido}`);
    return next();

  } else {

    console.log("Usuario não permitido")
    return res.status(401).json({message: "Usuario não tem permissão para acessar rotas"})
 
  }

}

export default adminMiddleware;