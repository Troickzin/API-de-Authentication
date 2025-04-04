import { verifyToken } from "../services/tokenServices";

async function authMiddleware(req:any, res:any, next:any) {

  const accessToken = req.cookies.accessToken;
  const tokenVerificado = await verifyToken(accessToken)

  if (tokenVerificado) {

  return next();

  } else {

    return res.status(401).json({message: "Usuario não está logado"})

  }

}

export default authMiddleware;