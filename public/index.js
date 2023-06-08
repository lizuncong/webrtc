console.log("webrtc demo=====");

const defaultConfiguration = {
  // bundlePolicy: "max-bundle",
  // rtcpMuxPolicy: "require",
  // iceTransportPolicy: "relay", // 先设置为relay，只有relay中继模式可用的时候，才能部署到公网。部署到公网后也先测试relay
  // iceServers: [
  //   {
  //     urls: [
  //       "stun:stun.l.google.com:19302",
  //       "stun:global.stun.twilio.com:3478",
  //     ],
  //   },
  // ],
};
const peer = new RTCPeerConnection(defaultConfiguration);
// handleIceCandidate
peer.onicecandidate = (event) => {
  const candidate = event.candidate;
  console.log("candidate======", candidate);
};

// handleRemoteStreamAdd
peer.ontrack = (event) => {
  console.log("ontrack...", event.streams);
  remoteStream = event.streams[0];
  remoteVideo.srcObject = remoteStream;
};
peer.onconnectionstatechange = () => {
  console.log("onconnectionstatechange..", peer.connectionState);
};
peer.oniceconnectionstatechange = () => {
  console.log("oniceconnectionstatechange.", peer.iceConnectionState);
};

// pc.addTrack(track, localStream);