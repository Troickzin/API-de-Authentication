import app from './app';
import express from "express";
import dotenv from "dotenv";
import "./config/db";

dotenv.config();

const port = process.env.PORT || 3013;

app.listen(port, () => {
  console.log('  ');
  console.log(`☁️ Servidor rodando em http://localhost:${port}`);
  console.log('  ');
});

export default app;