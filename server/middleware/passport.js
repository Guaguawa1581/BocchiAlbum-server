const dbConnect = require("./dbConnect");
const localDb = require("./localDb");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const passportOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
  secretOrKey: process.env.PASSPORT_SECRET
};

passport.use(
  "user",
  new JwtStrategy(passportOpts, async function (jwt_payload, done) {
    if (Date.now() > jwt_payload.exp) {
      return done(null, false, { message: "Token 已經過期" });
    }
    // dbConnect(...)
    console.log('JJJJJJJJJJJJJ', jwt_payload);
    try {
      const checkResult = await localDb.selectSql(
        "SELECT * FROM users WHERE user_id = ? AND email = ?",
        [jwt_payload.userId, jwt_payload.email]);

      if (checkResult.length > 0) {
        return done(null, checkResult);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }

  })
);

module.exports = {
  userPassport: passport.authenticate("user", {
    session: false,
    failWithError: true
  })
};
