# VideoSDK Room Switching - React Implementation
A React application demonstrating seamless room switching and media relay features using VideoSDK.

# Project Overview
This project implements two key VideoSDK features:
1. `switchTo()` - Seamless transition between rooms (Normal Room Switching)
2. `requestMediaRelay()` - Cross-room media streaming (Media Relay)

# Features
# Implemented Features
- Create and join VideoSDK rooms
- Normal room switching with `switchTo()`
- Media relay with `requestMediaRelay()`
- Accept/reject media relay requests
- Real-time audio/video communication
- Toggle microphone and camera
- Participant grid view
- Beautiful, responsive UI

# Room Switching Methods

1. Normal Switch (`switchTo()`)
- **What it does:** Moves participant from Room A → Room B
- **Benefits:**
  - Keeps existing socket connection alive
  - Reuses media transports
  - Fast switching (no reconnection delay)
  - Maintains media continuity

2. Media Relay (`requestMediaRelay()`)
- **What it does:** Sends your audio/video to another room without leaving current room
- **Benefits:**
  - Stay in Room A while streaming to Room B
  - Perfect for "PK battles" and collaborative broadcasts
  - Selective media relay (audio, video, or both)
  - Audiences in Room B can see/hear you

# Setup Instructions

# Prerequisites
- Node.js (v14 or higher)
- npm
- VideoSDK account ([Sign up here](https://app.videosdk.live))

# Installation

1. Clone the repository
   ```bash
   git clone https://github.com/smit135/videosdk-room-demo.git
   cd videosdk-room-demo
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Install VideoSDK
   ```bash
   npm install @videosdk.live/react-sdk
   ```

4. Run the app
   ```bash
    npm start
   ```
   Navigate to `http://localhost:3000`


5. Get your VideoSDK token
   - Visit [VideoSDK Dashboard](https://app.videosdk.live/api-keys)
   - Generate a temporary token

6. Configure API.js
   
   Create `src/API.js`:
   ```javascript
   export const authToken = "YOUR_TOKEN_HERE";

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
   ```

7. Run the application
   ```bash
   npm start
   ```

# Testing Instructions

# Testing Normal Room Switching

1. Open Tab 1 (Room A)
   - Click "Create Room"
   - Copy the Room ID displayed
   - Join the room

2. Open Tab 2 (Room B)
   - Open application in new tab/browser
   - Click "Create Room" again
   - Copy this Room ID too
   - Join the room

3. Test Switching
   - In Tab 1 (Room A), click " Switch Room" button
   - Select " Normal Switch"
   - Paste Room B's ID
   - Click "Switch to Room"
   -  You'll seamlessly move from Room A → Room B

# Testing Media Relay

1. Setup Two Rooms (same as above)
   - Room A in Tab 1
   - Room B in Tab 2

2. Request Media Relay
   - In Room A (Tab 1), click " Switch Room"
   - Select " Media Relay"
   - Enter Room B's ID
   - Select media types (video, audio, or both)
   - Click "Send Relay Request"

3. Accept in Destination Room
   - In Room B (Tab 2), you'll see a popup
   - "Accept" or "Reject" the relay request

4. Verify Relay
   - If accepted, Room A's participant appears in Room B
   - Room A stays in their original room
   - Room B sees and hears Room A's participant

# How It Works

# Normal Room Switching Architecture
   - Room A -> Room B

**Flow:**
1. User calls `switchTo({ meetingId: roomB_Id, token })`
2. SDK keeps WebSocket connection alive
3. Reconfigures existing media transports
4. Server switches context to new room
5. Participant appears in Room B instantly

# Media Relay Architecture
  - Room A -> Room B
  - Still in Room A and B both

**Flow:**
1. Host A calls `requestMediaRelay({ destinationMeetingId, token, kinds })`
2. Host B receives `onMediaRelayRequestReceived` event
3. Host B accepts or rejects
4. If accepted: Host A's media streams to Room B
5. Host A stays in Room A, visible in both rooms

# Key Differences

1. Normal Switch:-
  - Location: The participant actually moves to the new room.
  - Visibility: They are only visible in the room they switch to.
  - Socket: The same socket connection is reused.
  - Use Case: Best for when a participant fully transfers to another room.
  - Latency: Very low since no reconnection is needed.
  - Control: The participant initiates the switch themselves

2. Media Relay:-
  - Location: The participant stays in their original room.
  - Visibility: Their media is visible in both the current room and the target room.
  - Socket: Keeps using the original socket connection.
  - Use Case: Useful for sharing or collaborating across rooms.
  - Latency: Also very low because the stream is passed directly.
  - Control: Requires approval from the destination room to allow the relay.

# Implementation Details

# `switchTo()` Method
```javascript
const { switchTo } = useMeeting();

await switchTo({
  meetingId: "target-room-id",
  token: authToken,  // Optional
});
```

**Key Points:**
- Destination room must be active
- Token can be reused or new one provided
- Maintains media continuity
- No disconnect/reconnect needed

# `requestMediaRelay()` Method
```javascript
const { requestMediaRelay } = useMeeting();

await requestMediaRelay({
  destinationMeetingId: "target-room-id",
  token: authToken,
  kinds: ["video", "audio"],  // Optional: ["video", "audio", "share", "share_audio"]
});
```

**Key Points:**
- Requires acceptance from destination room host
- Can relay video, audio, screen share
- Source participant stays in original room
- Perfect for PK battles, guest appearances

# Limitations & Challenges

# Normal Room Switching
1. **Destination must be active** - Target room must exist before switching
2. **Token expiry** - Short-lived tokens may cause issues
3. **Network stability** - Poor connection affects switch quality
4. **State management** - Local component state needs handling

# Media Relay
1. **Approval required** - Destination room host must accept
2. **Network bandwidth** - Streaming to multiple rooms increases usage
3. **Relay limit** - Check VideoSDK docs for concurrent relay limits
4. **Permissions** - May need special token permissions
5. **Debugging** - More complex than normal switching

# General Challenges
- **Browser permissions** - Must grant camera/microphone access
- **HTTPS required** - WebRTC only works on HTTPS (or localhost)
- **Cross-browser compatibility** - Some features work differently
- **Error handling** - Need robust error handling for production

# References
- [VideoSDK Dashboard](https://app.videosdk.live)
- [VideoSDK React Quick Start](https://docs.videosdk.live/react/guide/video-and-audio-calling-api-sdk/quick-start)
- [Switch Live Stream](https://docs.videosdk.live/react/guide/interactive-live-streaming/switch-live-stream)
- [Media Relay Documentation](https://docs.videosdk.live/react-native/guide/interactive-live-streaming/relay-media)



# Author
Smit Pansuriya