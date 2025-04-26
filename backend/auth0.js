const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://YOUR_AUTH0_DOMAIN/.well-known/jwks.json`,
  }),
  audience: "YOUR_API_AUDIENCE",
  issuer: `https://YOUR_AUTH0_DOMAIN/`,
  algorithms: ["RS256"],
});

const getPlayerIdFromToken = async (req, pool) => {
  const auth0Id = req.user.sub; // Auth0 'sub'
  const result = await pool.query(
    "SELECT player_id FROM players WHERE auth0_id = $1",
    [auth0Id]
  );
  if (result.rows.length === 0) {
    // Create player if not exists
    const newPlayer = await pool.query(
      "INSERT INTO players (auth0_id) VALUES ($1) RETURNING player_id",
      [auth0Id]
    );
    return newPlayer.rows[0].player_id;
  }
  return result.rows[0].player_id;
};

module.exports = { checkJwt, getPlayerIdFromToken };