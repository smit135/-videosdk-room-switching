import React, { useEffect, useRef, useState } from "react";
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
  VideoPlayer,
} from "@videosdk.live/react-sdk";
import { createMeeting, authToken } from "./API";

// ROOM SWITCHING MODAL
function RoomSwitchModal({ currentMeetingId, onClose }) {
  const { switchTo, requestMediaRelay } = useMeeting();
  const [targetRoomId, setTargetRoomId] = useState("");
  const [switchMode, setSwitchMode] = useState("normal"); // 'normal' or 'relay'
  const [relayKinds, setRelayKinds] = useState({
    video: true,
    audio: true,
  });
  const [loading, setLoading] = useState(false);

  const handleNormalSwitch = async () => {
    if (!targetRoomId.trim()) {
      alert("Please enter a target room ID");
      return;
    }

    setLoading(true);
    try {
      console.log(`Switching from ${currentMeetingId} to ${targetRoomId}`);
      await switchTo({
        meetingId: targetRoomId,
        token: authToken,
      });
      alert(`Successfully switched to room: ${targetRoomId}`);
      onClose();
    } catch (error) {
      console.error("Switch failed:", error);
      alert(`Failed to switch: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaRelay = async () => {
    if (!targetRoomId.trim()) {
      alert("Please enter a target room ID");
      return;
    }
    const kinds = [];
    if (relayKinds.video) kinds.push("video");
    if (relayKinds.audio) kinds.push("audio");
    if (kinds.length === 0) {
      alert("Please select at least one media type to relay");
      return;
    }
    setLoading(true);
    try {
      console.log(
        `Requesting media relay to ${targetRoomId} with kinds:`,
        kinds
      );
      await requestMediaRelay({
        destinationMeetingId: targetRoomId,
        token: authToken,
        kinds: kinds,
      });
      alert(
        `Media relay request sent to room: ${targetRoomId}\nWaiting for host approval...`
      );
    } catch (error) {
      console.error("Media relay failed:", error);
      alert(`Failed to relay media: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-8 max-w-lg w-full border-2 border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Room Switching</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl transition"
          >
            ×
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-400/30">
          <p className="text-sm text-blue-200">
            <strong>Current Room:</strong>
            <span className="block text-xl font-mono mt-1 text-blue-300">
              {currentMeetingId}
            </span>
          </p>
        </div>

        {/* Target Room Input */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-3">
            Target Room ID
          </label>
          <input
            type="text"
            value={targetRoomId}
            onChange={(e) => setTargetRoomId(e.target.value)}
            placeholder="Enter target room ID"
            className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={loading}
          />
        </div>

        {/* Switch Mode Selection */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-3">
            Switch Method
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setSwitchMode("normal")}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition ${
                switchMode === "normal"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
              disabled={loading}
            >
              Normal Switch
            </button>
            <button
              onClick={() => setSwitchMode("relay")}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition ${
                switchMode === "relay"
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
              disabled={loading}
            >
              Media Relay
            </button>
          </div>
        </div>

        {switchMode === "normal" ? (
          <div className="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-400/30">
            <p className="text-sm text-blue-200">
              <strong>Normal Switch:</strong> Seamlessly move to the target room
              while maintaining your media connections. Your socket connection
              stays alive.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 bg-green-500/10 rounded-xl border border-green-400/30">
              <p className="text-sm text-green-200">
                <strong>Media Relay:</strong> Send your audio/video to the
                target room without leaving your current room. Perfect for PK
                battles and cross-room collaboration!
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-white font-medium mb-3">
                Select Media to Relay
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={relayKinds.video}
                    onChange={(e) =>
                      setRelayKinds({ ...relayKinds, video: e.target.checked })
                    }
                    className="w-5 h-5"
                    disabled={loading}
                  />
                  <span className="text-white">📹 Video</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={relayKinds.audio}
                    onChange={(e) =>
                      setRelayKinds({ ...relayKinds, audio: e.target.checked })
                    }
                    className="w-5 h-5"
                    disabled={loading}
                  />
                  <span className="text-white">🎤 Audio</span>
                </label>
              </div>
            </div>
          </>
        )}

        {/* Action Button */}
        <button
          onClick={
            switchMode === "normal" ? handleNormalSwitch : handleMediaRelay
          }
          disabled={loading || !targetRoomId.trim()}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl text-white font-bold text-lg transition transform hover:scale-105 disabled:scale-100"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Processing...
            </span>
          ) : switchMode === "normal" ? (
            "Switch to Room"
          ) : (
            "Send Relay Request"
          )}
        </button>
      </div>
    </div>
  );
}

// MEDIA RELAY REQUEST HANDLER (for destination room)
function MediaRelayHandler() {
  const [pendingRequest, setPendingRequest] = useState(null);

  useMeeting({
    onMediaRelayRequestReceived: ({
      participantId,
      meetingId,
      displayName,
      accept,
      reject,
    }) => {
      console.log(
        `Media relay request from ${displayName} (Room: ${meetingId})`
      );
      setPendingRequest({
        participantId,
        meetingId,
        displayName,
        accept,
        reject,
      });
    },
    onMediaRelayRequestResponse: (participantId, decision) => {
      console.log(`Relay request ${decision} by ${participantId}`);
      alert(`Media relay request ${decision}!`);
    },
    onMediaRelayStarted: ({ meetingId }) => {
      console.log(`Media relay started with room: ${meetingId}`);
      alert(`Media relay started! You're now streaming to room: ${meetingId}`);
    },
    onMediaRelayStopped: ({ meetingId, reason }) => {
      console.log(
        `Media relay stopped (Room: ${meetingId}, Reason: ${reason})`
      );
      alert(`Media relay stopped\nRoom: ${meetingId}\nReason: ${reason}`);
    },
    onMediaRelayError: (meetingId, error) => {
      console.error(`Media relay error (Room: ${meetingId}):`, error);
      alert(`Media relay error: ${error}`);
    },
  });

  const handleAccept = () => {
    pendingRequest.accept();
    setPendingRequest(null);
  };

  const handleReject = () => {
    pendingRequest.reject();
    setPendingRequest(null);
  };

  if (!pendingRequest) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl shadow-2xl p-8 max-w-md w-full border-2 border-purple-400">
        <h3 className="text-2xl font-bold text-white mb-4">
          Media Relay Request
        </h3>
        <p className="text-white mb-2">
          <strong>{pendingRequest.displayName}</strong> wants to relay their
          media to your room
        </p>
        <p className="text-gray-300 text-sm mb-6">
          Room ID: <span className="font-mono">{pendingRequest.meetingId}</span>
        </p>

        <div className="flex gap-4">
          <button
            onClick={handleAccept}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-bold transition transform hover:scale-105"
          >
            Accept
          </button>
          <button
            onClick={handleReject}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-bold transition transform hover:scale-105"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// JOIN SCREEN COMPONENT
function JoinScreen({ getMeetingAndToken }) {
  const [meetingId, setMeetingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    await getMeetingAndToken(null);
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!meetingId?.trim()) {
      alert("Please enter a meeting ID");
      return;
    }
    setLoading(true);
    await getMeetingAndToken(meetingId);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center border border-white/20">
        <h1 className="text-5xl font-bold text-white mb-4">
          VideoSDK Room Switching
        </h1>
        <p className="text-xl text-gray-200 mb-10">
          Test switchTo() & Media Relay
        </p>

        <input
          type="text"
          placeholder="Enter Meeting ID"
          value={meetingId || ""}
          onChange={(e) => setMeetingId(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleJoin()}
          className="w-full px-6 py-4 rounded-xl bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-purple-400 text-lg font-mono mb-6"
          disabled={loading}
        />

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleJoin}
            disabled={!meetingId?.trim() || loading}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition transform hover:scale-105 disabled:scale-100 shadow-lg"
          >
            Join Room
          </button>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition transform hover:scale-105 disabled:scale-100 shadow-lg"
          >
            {loading ? "Creating..." : "Create Room"}
          </button>
        </div>

        <div className="mt-8 p-5 bg-amber-500/10 rounded-2xl border border-amber-400/30">
          <p className="text-sm text-amber-200 font-medium mb-3">
            Testing Instructions:
          </p>
          <ol className="text-left text-sm text-amber-100 space-y-2 list-decimal list-inside">
            <li>
              Create <strong>Room A</strong> (Tab 1)
            </li>
            <li>Copy Room A ID</li>
            <li>
              Create <strong>Room B</strong> (Tab 2)
            </li>
            <li>Copy Room B ID</li>
            <li>Use "Switch Room" button to test features</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// CONTROLS COMPONENT
function Controls() {
  const { leave, toggleMic, toggleWebcam, meetingId } = useMeeting();
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  return (
    <>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-xl rounded-full px-8 py-5 flex gap-6 shadow-2xl z-50 border-2 border-white/10">
        <button
          onClick={() => toggleMic()}
          className="px-7 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium transition transform hover:scale-105"
        >
          Mic
        </button>
        <button
          onClick={() => toggleWebcam()}
          className="px-7 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium transition transform hover:scale-105"
        >
          Cam
        </button>
        <button
          onClick={() => setShowSwitchModal(true)}
          className="px-7 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full text-white font-bold transition transform hover:scale-105"
        >
          Switch Room
        </button>
        <button
          onClick={() => leave()}
          className="px-10 py-3 bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800 rounded-full text-white font-bold transition transform hover:scale-105"
        >
          Leave
        </button>
      </div>

      {showSwitchModal && (
        <RoomSwitchModal
          currentMeetingId={meetingId}
          onClose={() => setShowSwitchModal(false)}
        />
      )}
    </>
  );
}

// PARTICIPANT VIEW COMPONENT
function ParticipantView(props) {
  const micRef = useRef(null);
  const { micStream, webcamOn, micOn, isLocal, displayName } = useParticipant(
    props.participantId
  );

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) => console.error("Audio play failed", error));
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
      <audio ref={micRef} autoPlay playsInline muted={isLocal} />

      {webcamOn ? (
        <VideoPlayer
          participantId={props.participantId}
          type="video"
          containerStyle={{
            width: "100%",
            height: "100%",
          }}
          videoStyle={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg">
            {displayName?.[0]?.toUpperCase() || "?"}
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
        <div className="text-white font-medium flex justify-between items-center">
          <span className="text-lg">
            {displayName}{" "}
            {isLocal && <span className="text-green-400">(You)</span>}
          </span>
          <div className="flex gap-3 text-sm">
            <span
              className={`px-3 py-1 rounded-full ${
                micOn ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {micOn ? "🎤 ON" : "🔇 OFF"}
            </span>
            <span
              className={`px-3 py-1 rounded-full ${
                webcamOn ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {webcamOn ? "📹 ON" : "📵 OFF"}
            </span>
          </div>
        </div>
      </div>

      {isLocal && (
        <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
          YOU
        </div>
      )}
    </div>
  );
}

// MEETING VIEW COMPONENT
function MeetingView(props) {
  const [joined, setJoined] = useState(null);
  const { join, participants, meetingId } = useMeeting({
    onMeetingJoined: () => {
      setJoined("JOINED");
      console.log("Meeting joined successfully!");
    },
    onMeetingLeft: () => {
      props.onMeetingLeave();
    },
  });

  const joinMeeting = () => {
    setJoined("JOINING");
    join();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative pb-32">
      <MediaRelayHandler />
      <div className="p-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4"> Active Room</h2>
          <div className="inline-block bg-black/40 backdrop-blur-lg rounded-2xl px-8 py-4 border-2 border-yellow-400/50">
            <p className="text-sm text-gray-300 mb-1">Room ID</p>
            <p className="text-3xl font-mono font-bold text-yellow-300 tracking-wider break-all">
              {meetingId || props.meetingId}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(props.meetingId);
                alert("Room ID copied!");
              }}
              className="mt-3 text-sm text-blue-300 hover:text-blue-200 underline transition"
            >
              📋 Copy
            </button>
          </div>
          <p className="text-gray-300 mt-4 text-sm">
            {joined === "JOINED" ? (
              <>
                - {participants.size} participant
                {participants.size !== 1 ? "s" : ""}
              </>
            ) : joined === "JOINING" ? (
              <>Joining room...</>
            ) : (
              <>Ready to join</>
            )}
          </p>
        </div>

        {joined && joined === "JOINED" ? (
          <div>
            <Controls />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {[...participants.keys()].map((participantId) => (
                <ParticipantView
                  participantId={participantId}
                  key={participantId}
                />
              ))}
            </div>
          </div>
        ) : joined && joined === "JOINING" ? (
          <div className="text-center text-white mt-20">
            <div className="inline-flex items-center gap-3 bg-blue-600/20 px-6 py-3 rounded-full border border-blue-400 mb-4">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span className="font-medium">Joining room...</span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={joinMeeting}
              className="px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl text-white text-xl font-bold transition transform hover:scale-105 shadow-2xl"
            >
              Join Room Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// MAIN APP COMPONENT
function App() {
  const [meetingId, setMeetingId] = useState(null);

  const getMeetingAndToken = async (id) => {
    const meetingId = id == null ? await createMeeting() : id;
    setMeetingId(meetingId);
  };

  const onMeetingLeave = () => {
    setMeetingId(null);
  };

  return authToken && meetingId ? (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: "User-" + Math.floor(Math.random() * 1000),
      }}
      token={authToken}
    >
      <MeetingView meetingId={meetingId} onMeetingLeave={onMeetingLeave} />
    </MeetingProvider>
  ) : (
    <JoinScreen getMeetingAndToken={getMeetingAndToken} />
  );
}

export default App;
