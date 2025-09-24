import { expressjwt as jwt } from "express-jwt";
import jwksRsa from "jwks-rsa";

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

export const asegurarUsuario = async (req, res, next) => {
  try {
    const userId = req.body._id || req.params.id;
    const { email, nombreUsuario } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "No se proporcionó ID de usuario." });
    }

    let usuario = await UsuarioRutas.findById(userId);

    if (!usuario) {
      if (!email || !nombreUsuario) {
        return res
          .status(400)
          .json({ message: "Faltan datos para crear el nuevo usuario." });
      }

      const nuevoUsuario = new UsuarioRutas({
        _id: userId,
        email,
        nombreUsuario,
      });
      usuario = await nuevoUsuario.save();
      console.log(`Middleware: Usuario ${usuario.nombreUsuario} creado.`);
    }

    req.usuario = usuario;

    next();
  } catch (error) {
    console.error("Error en el middleware asegurarUsuario:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export { checkJwt, checkPermissions };
