import dotenv from 'dotenv';
dotenv.config();

const allowedOrigins = [
  process.env.FRONT_END_URL, 
  process.env.BACK_END_URL
];

const corsOptions = {
  credentials: true,
  origin: function (origin:any, callback:any) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      if (origin != undefined) {console.log(`Request from allowed origin: ${origin}`)}
      
      callback(null, true);
    } else {
      
      if (origin != undefined) {console.log(`Access denied for origin: ${origin}`)}
      
      callback(new Error('Acesso negado.'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

export default corsOptions;