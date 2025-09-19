const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://dev-rpyuayp11lw3b1hr.us.auth0.com/.well-known/jwks.json`,
  }),

  audience: "https://bussmart.onrender.com",
  issuer: `https://dev-rpyuayp11lw3b1hr.us.auth0.com/`,
  algorithms: ["RS256"],
});

const checkPermissions = (requiredPermissions) => {
  return (req, res, next) => {
    const userPermissions = req.auth.permissions || [];
    const hasPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermissions) {
      return res.status(403).send({ message: "Permiso denegado." });
    }

    next();
  };
};

module.exports = {
  checkJwt,
  checkPermissions,
};
