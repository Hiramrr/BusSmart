import { expressjwt as jwt } from "express-jwt";
import jwksRsa from "jwks-rsa";

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://dev-rpyuayp11lw3b1hr.us.auth0.com/.well-known/jwks.json`,
  }),
  audience: ["http://localhost:3000", "https://bussmart.onrender.com"],
  issuer: `https://dev-rpyuayp11lw3b1hr.us.auth0.com/`,
  algorithms: ["RS256"],
});

const checkJwtWithDebug = (req, res, next) => {
  console.log("🔒 === VERIFICANDO JWT ===");
  console.log("🌐 URL:", req.url);
  console.log("📝 Method:", req.method);
  console.log(
    "🔑 Authorization header:",
    req.headers.authorization ? "PRESENTE" : "AUSENTE",
  );

  if (req.headers.authorization) {
    const token = req.headers.authorization.replace("Bearer ", "");
    console.log(
      "🎫 Token (primeros 50 chars):",
      token.substring(0, 50) + "...",
    );
  }

  checkJwt(req, res, (err) => {
    if (err) {
      console.error("❌ Error JWT completo:", err);
      console.error("❌ Error name:", err.name);
      console.error("❌ Error code:", err.code);
      console.error("❌ Error status:", err.status);
      return res.status(401).json({
        message: "Token inválido",
        error: err.message,
        code: err.code,
      });
    }
    console.log("✅ JWT válido");
    console.log("👤 req.auth:", req.auth);
    next();
  });
};

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

export const asegurarUsuario = async (req, res, next) => {
  console.log("👤 === ASEGURAR USUARIO ===");
  console.log("🆔 req.auth:", req.auth);

  try {
    const userId = req.auth?.sub; // El ID viene del token JWT

    console.log("🆔 User ID extraído:", userId);

    if (!userId) {
      return res
        .status(401)
        .json({ message: "No se proporcionó ID de usuario en el token." });
    }

    // Solo pasar el userId al siguiente middleware/controlador
    req.userId = userId;
    next();
  } catch (error) {
    console.error("Error en el middleware asegurarUsuario:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export { checkJwtWithDebug as checkJwt, checkPermissions };
