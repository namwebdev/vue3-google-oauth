require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyToken(token) {
  client.setCredentials({ access_token: token });
  const userinfo = await client.request({
    url: "https://www.googleapis.com/oauth2/v3/userinfo",
  });
  return userinfo.data;
}

async function verifyCredentials(credential) {
  const ticket = await client.verifyIdToken({
    idToken: credential,
  });
  const payload = ticket.getPayload();
  return payload;
}

const input = ""; // Replace input here
verifyCredentials(input)
  .then((userInfo) => {
    console.log(userInfo);
  })
  .catch((error) => {
    console.log(error);
  });
