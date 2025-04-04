import mongoose, { Connection } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const { USER_MONGODB_URI, PACKS_MONGODB_URI, CONFIG_MONGODB_URI } = process.env;

if (!USER_MONGODB_URI || !PACKS_MONGODB_URI || !CONFIG_MONGODB_URI) {
  throw new Error("As variáveis de ambiente USER_MONGODB_URI e PACKS_MONGODB_URI são obrigatórias!");
}

const userDB: Connection = mongoose.createConnection(USER_MONGODB_URI);

const configDB: Connection = mongoose.createConnection(CONFIG_MONGODB_URI);

userDB.on("connected", () => console.log("🔥 User Database conectado"));
configDB.on("connected", () => console.log("⚙️ Config Database conectado"));
userDB.on("error", (err) => console.error("❌ Erro no UserDB:", err));
configDB.on("error", (err) => console.error("❌ Erro no ConfigDB:", err));

export { userDB };