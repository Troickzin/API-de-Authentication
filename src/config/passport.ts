import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Usuario from '../models/usuarioModel';
import dotenv from 'dotenv';

dotenv.config();

interface IState {
  [key: string]: any;
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true
}, async (req:any, accessToken: string, refreshToken: string, profile:any, done:any) => {

  try {

    let userFound = await Usuario.findOne({ 'dados.google.id': profile.id });
    let state = await req.query?.state;

    console.log(userFound)
    console.log(state)

    if (userFound && !state) return done(null, userFound, { message: 'Logando com o Google' });
    else {

      if (state) {

        const decodedState = decodeURIComponent(state);
        try {state = JSON.parse(decodedState);} catch (err) {state = decodedState;}
        return done(null, false, { message: 'Vinculando conta do Google', frontUser: state, profile });

      }

      else return done(null, false, { message: 'Necessário vincular uma conta existente com o Google' });

    }

  } catch (err) {

    console.error('erro durante a autenticação', err);
    return done(err, false, { message: 'Erro durante a autenticação' });

  }

}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async(id: string, done) => {
  try {
    const user = await Usuario.findById(id);
    done(null, user);
  } catch (err) {
    console.error('Error during deserialization', err);
    done(err, null);
  }
});