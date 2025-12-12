export const authToken = process.env.REACT_APP_VIDEOSDK_AUTH_TOKEN;

// eslint-disable-next-line
export const createMeeting = async () => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: "POST",
    headers: {
      authorization: `${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  const { roomId } = await res.json();
  return roomId;
};
