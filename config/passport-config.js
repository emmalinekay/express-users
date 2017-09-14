const passport = require('passport');

const UserModel = require('../models/user-model.js');


// "serializeUser" is called when the user logs in.
// it determines what gets saved into the session when you log in.
passport.serializeUser((userFromDb, done) => {
      // tell passport we want to save the ID inside the session
      //                   |
    done(null, userFromDb._id);
      //   |
      // "null" as the first argument means "no error" (good)
});


// "deserializeUser" is called on every request AFTER logging in.
// it tells passport how to get the user's information
// with the contents of the session (in this case, the ID).
passport.deserializeUser((idFromBowl, done) => {
    UserModel.findById(
      idFromBowl,

      (err, userFromDb) => {
          // if there's a database error, inform passport.
          if (err) {
              done(err);
              return;
          }

            // give passport the user document from the database
            //            |
          done(null, userFromDb);
            //   |
            // "null" as the first argument means "no error" (good)
      }
    );
});



// ---------------------------------------------------------------------
//
// STRATEGIES SETUP


const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// "passport.use()" sets up a new strategy
passport.use(
  new LocalStrategy(
    // 1st arg -> settings object
    {
        usernameField: 'loginEmail',
        passwordField: 'loginPassword'
    }, //     |              |
       //     |         names of your input fields
       // settings defined by LocalStrategy

    // 2nd arg -> callback
    (emailValue, passValue, done) => {
        // find the user in the DB with that email
        UserModel.findOne(
          { email: emailValue },

          (err, userFromDb) => {
              if (err) {
                  done(err);
                  return;
              }

              // "userFromDb" will be "null" if we didn't find anything
              if (userFromDb === null) {
                    // "null" here again means "no error"
                    //  |  LOGIN FAILED (email is wrong)
                    //  |      |
                  done(null, false, { message: 'Email is wrong. 💩' });
                  return;
              }

              // confirm that the password is correct
              const isGoodPassword =
                  bcrypt.compareSync(passValue, userFromDb.encryptedPassword);

              if (isGoodPassword === false) {
                    // "null" here again means "no error"
                    //  |  LOGIN FAILED (password is wrong)
                    //  |      |
                  done(null, false, { message: 'Password is wrong. 💩' });
                  return;
              }

              // if everything works, send passport the user document.
              done(null, userFromDb);
                //           |
                // passport takes "userFromDb" and calls "serializeUser"
          }
        ); // close UserModel.findOne( ...
    }
  ) // close new LocalStrategy( ...
);



const FbStrategy = require('passport-facebook').Strategy;

// "passport.use()" sets up a new strategy
passport.use(
  new FbStrategy(
    // 1st arg -> settings object
    {
        // clientID = App ID
        clientID: '185478141483846',
        // clientSecret = App Secret
        clientSecret: '915ea8258ce473dd4c536bd8ba7eccc0',
        callbackURL: '/auth/facebook/callback'
    },

    // 2nd arg -> callback
    // gets called after a SUCCESSFUL Facebook login
    (accessToken, refreshToken, profile, done) => {
        console.log('Facebook user info:');
        console.log(profile);

        // check to see if it's the first time they log in
        UserModel.findOne(
          { facebookID: profile.id },

          (err, userFromDb) => {
              if (err) {
                  done(err);
                  return;
              }

              // if the user already has an account, GREAT! log them in.
              if (userFromDb) {
                  done(null, userFromDb);
                  return;
              }

              // if they don't have an account, make one for them.
              const theUser = new UserModel({
                  facebookID: profile.id,
                  email: profile.displayName
              });

              theUser.save((err) => {
                  if (err) {
                      done(err);
                      return;
                  }

                  // if save is successful, log them in.
                  done(null, theUser);
              });
          }
        ); // close UserModel.findOne( ...
    }
  ) // close new FbStrategy( ...
);

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.use(
  new GoogleStrategy (
    {
        clientID: '401199260144-3pda82kkp3u0k81eoe5cbfrqs5j7b7en.apps.googleusercontent.com',
        clientSecret: '9B46macbE2_0HOVM1kC1kO6c',
        callbackURL: '/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
        UserModel.findOne(
          { googleID: profile.id },

          (err, userFromDb) => {
            if(err) {
              done(err);
              return;
            }
            //if there's an account, log them in
            if(userFromDb) {
                done(null, userFromDb);
                return;
            }
            //otherwise create an account for them
            const theUser = new UserModel({
              googleID: profile.id,
              email: profile.emails[0].value
            });

            theUser.save((err) => {
              if(err) {
                done(err);
                return;
              }

              done(null, theUser);
            });
          }
        );
    }
  )
);
