const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Existing user -> just log them in
          return done(null, user);
        }

        // First time login -> create a new user record
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails && profile.emails[0] ? profile.emails[0].value : "",
          profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : "",
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Store only the user id in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Retrieve full user from DB using the id stored in the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
