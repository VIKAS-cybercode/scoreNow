//Auth token we will use to generate a stream and connect to it
export const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiJiYzE4ZGE3MS05NDM5LTRiM2QtOGZhMS04OTdhYWE4ZDg3ZDgiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTc0MzQ0NjkyNiwiZXhwIjoxOTAxMjM0OTI2fQ.OU-JJ4iASZMIXkseHPBVZpMhLWHTZDX0Zl-hcv9V_3A";
// API call to create stream
export const createStream = async ({ token }) => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: "POST",
    headers: {
      authorization: `${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  //Destructuring the streamId from the response
  const { roomId: streamId } = await res.json();
  return streamId;
};