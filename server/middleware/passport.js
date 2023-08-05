const dbConnect = require("./dbConnect");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const passportOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
  secretOrKey: process.env.PASSPORT_SECRET
};

passport.use(
  "user",
  new JwtStrategy(passportOpts, function (jwt_payload, done) {
    if (Date.now() > jwt_payload.exp) {
      return done(null, false, { message: "Token 已經過期" });
    }
    dbConnect(
      "SELECT * FROM users WHERE user_id = ? AND email = ?",
      [jwt_payload.userId, jwt_payload.email],
      (error, user) => {
        //(err,result)
        if (error) {
          return done(error, false);
        } else if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      }
    );
  })
);

module.exports = {
  userPassport: passport.authenticate("user", {
    session: false,
    failWithError: true
  })
};
