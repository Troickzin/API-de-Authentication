import { Schema, Document, Model } from "mongoose";
import { userDB } from "../config/db";

interface IGoogle {
  id?: string;
  email?: string;
}

interface IDados {
  email: string;
  senha: string;
  tipo: "cliente" | "admin";
  google?: IGoogle;
}

interface IPerfil {
  nome: string;
  apelido: string;
  imagem_perfil: string;
}

interface IUsuario extends Document {
  perfil: IPerfil;
  dados: IDados;
}

const UserSchema = new Schema<IUsuario>(
  {
    perfil: {
      nome: { type: String, required: true },
      apelido: { type: String, required: true, unique: true },
      imagem_perfil: { type: String, required: true },
    },
    dados: {
      email: { type: String, required: true, unique: true },
      senha: { type: String, required: true },
      tipo: {
        type: String,
        required: true,
        enum: ["cliente", "admin"],
        default: "cliente",
      },
      google: {
        id: { type: String, unique: true, sparse: true },
        email: { type: String, unique: true, sparse: true },
      },
    },
  },
  {
    timestamps: { createdAt: "data_cadastro", updatedAt: "data_alteracao" },
    versionKey: false,
  }
);

const UserModel: Model<IUsuario> = userDB.model<IUsuario>("Usuario", UserSchema);

export default UserModel;