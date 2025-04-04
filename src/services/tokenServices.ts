import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config()

// --------------------------------------------------------------------------------

const jwtSecret = process.env?.JWT_SECRET as string

// --------------------------------------------------------------------------------

const verifyToken = async (token: string): Promise<boolean> => {
  try {
    jwt.verify(token, jwtSecret)
    return true;
  } catch (err) {
    console.error('Erro ao verificar o token:', err);
    return false;
  }
};

// --------------------------------------------------------------------------------

const generateToken = async (payload:object, type:string) => {
    
    const expire = type == "access" ? '1h' : type == "refresh" ? '7d' : '1m'

    const token = jwt.sign(payload, jwtSecret, { expiresIn: expire });
    return token;

}

// --------------------------------------------------------------------------------

const decodeToken = async (token: string) => {

    const decoded = jwt.decode(token, { complete: false });
    return decoded;

}

// --------------------------------------------------------------------------------

export { verifyToken, generateToken, decodeToken };