import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import fs from 'fs';
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

require("dotenv").config();

const router = express.Router();

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj: any, cb) {
  cb(null, obj);
});

const TTL = 3600;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: `http://localhost:${process.env.PORT}/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      const { displayName: username, emails } = profile;
      const email = emails && emails.length > 0 ? emails[0].value : '';
      const expiry = Math.floor(Date.now() / 1000) + TTL;

      const userData = {
        username,
        email,
        expiry
      };

      const filename = './static/userData/user-data.json';

      let users : any = {};
      
      if(fs.existsSync(filename)){
        users = JSON.parse(fs.readFileSync(filename, 'utf-8')) || {}
      }

      const userID = profile.id;
      users[userID] = userData;

      fs.writeFileSync(filename, JSON.stringify(users, null, 2));
      // console.log('User data written to file user-data.json:', userData);

      return done(null, userID);
    }
  )
);

const logout = async (req: express.Request, res: express.Response) => {
  res.set(
    'Set-Cookie',
    cookie.serialize('token', '', {
      expires: new Date(0),
      sameSite: 'lax',
      path: '/'
    })
  )
  res.redirect('/');
}

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/logout', logout);
router.get('/status', (req, res) => {
  const token = req.cookies.token;
  if(token) return true;
  else return false;
})
router.get(
  '/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const { user } = req

    const token = jwt.sign({
      userID: user
    }, process.env.JWT_SECRET as string, {
      expiresIn: '1d',
      algorithm: 'HS256'
    });

    res.set(
      'Set-Cookie',
      cookie.serialize('token', token, {
      maxAge: 24*3600,
      sameSite: 'lax',
      path: '/'
    }))

    res.redirect('/');
  }
);

export default router;
