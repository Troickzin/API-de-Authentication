import { Request, Response, NextFunction, Router } from 'express';
import AuthController from '../controllers/AuthController';
import dotenv from 'dotenv';
import multer from 'multer';
import os from 'os';
import passport from 'passport';

const router: Router = Router();
dotenv.config();
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadPath = os.tmpdir() + '/uploads';
		cb(null, uploadPath);
	},
	filename: (req, file, cb) => {
    cb(null, file.originalname);
	}
});
const upload = multer({ storage });

router.post('/signin', upload.single('file'), AuthController.signIn);
router.post('/signout', AuthController.signOut);
router.post('/signup', upload.single('file'), AuthController.signUp);

router.get('/verify/:id', AuthController.verifyRegister)

router.get('/google', (req:Request, res:Response, next:NextFunction) => {
  const state = req.query.state as string | undefined;
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    state
  })(req, res, next);
});

router.get('/google/callback',(req:Request, res:Response, next:NextFunction) => {
  passport.authenticate('google', {
    session: false
  }, (err:Error, user, info) => {
    if (err) {
      return next(err);
    }
    req.authInfo = info;
    req.user = user;
    return AuthController.googleSignIn(req, res);
  })(req, res, next);
});

export default router;