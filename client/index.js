const SIGNAL_TYPE_JOIN = "join";
const SIGNAL_TYPE_RESP_JOIN = "resp-join";
const SIGNAL_TYPE_LEAVE = "leave";
const SIGNAL_TYPE_NEW_PEER = "new-peer";
const SIGNAL_TYPE_PEER_LEAVE = "peer-leave";
const SIGNAL_TYPE_OFFER = "offer";
const SIGNAL_TYPE_ANSWER = "answer";
const SIGNAL_TYPE_CANDIDATE = "candidate";

let localStream = null;
let remoteStream = null;
const localUserId = Math.random().toString(36).substring(2);
let remoteUserId;

class BroadCaster {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.websocket = null;
    this.createWebsocket();
  }
  createWebsocket() {
    this.websocket = new WebSocket(this.wsUrl);
    this.websocket.onopen = (e) => {
      console.log("ws open", e);
    };
    this.websocket.onmessage = (e) => {
      console.log("ws onmessage", e.data);
      const jsonMsg = JSON.parse(e.data);
      switch (jsonMsg.cmd) {
        case SIGNAL_TYPE_NEW_PEER:
          this.handleRemoteNewPeer(jsonMsg);
          break;
        case SIGNAL_TYPE_RESP_JOIN:
          this.handleRemoteRespJoin(jsonMsg);
          break;
        case SIGNAL_TYPE_PEER_LEAVE:
          this.handleRemotePeerLeave(jsonMsg);
          break;
        case SIGNAL_TYPE_OFFER:
          handleRemoteOffer(jsonMsg);
          break;
        case SIGNAL_TYPE_ANSWER:
          handleRemoteAnswer(jsonMsg);
          break;
        case SIGNAL_TYPE_CANDIDATE:
          handleRemoteCandidate(jsonMsg);
          break;
      }
    };
    this.websocket.onerror = (e) => {
      console.log("ws onerror", e);
    };
    this.websocket.onclose = (e) => {
      console.log("ws onclose", e);
    };
  }
  sendMessage(msg) {
    this.websocket.send(JSON.stringify(msg));
  }
  handleRemoteNewPeer(msg) {
    console.log("有新的客户端连接进来了...", msg);
    remoteUserId = msg.remoteUid
    createOffer();
  }
  handleRemoteRespJoin(msg) {
    remoteUserId = msg.remoteUid
    console.log("加入房间成功，房间内其他成员信息：", msg);
  }
  handleRemotePeerLeave(msg) {
    console.log("有用户离开了。。。", msg);
    remoteVideo.srcObject = null;
  }
}

const broadCaster = new BroadCaster("ws://localhost:8088");
let peerConn;
const createPeerConnection = () => {
  const pc = new RTCPeerConnection();
  // handleIceCandidate
  pc.onicecandidate = (event) => {
    const candidate = event.candidate;
    console.log("handleIceCandidate==", candidate);
    if (candidate) {
      console.log("onicecandidate信息。。", candidate);
      const jsonMsg = {
        cmd: "candidate",
        roomId: roomId.value,
        uid: localUserId,
        remoteUid: remoteUserId,
        msg: JSON.stringify(candidate),
      };
      console.log("发送打洞信息...", jsonMsg);
      broadCaster.sendMessage(jsonMsg);
    } else {
      console.warn("End of candidate.打洞失败");
    }
  };
  // handleRemoteStreamAdd
  pc.ontrack = (event) => {
    console.log("ontrack...", event.streams);
    remoteStream = event.streams[0];
    remoteVideo.srcObject = remoteStream;
  };
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });
  return pc;
};
const handleRemoteOffer = (message) => {
  console.log("handleRemoteOffer===", message);
  if (!peerConn) {
    peerConn = createPeerConnection();
  }
  const desc = JSON.parse(message.msg);
  peerConn.setRemoteDescription(desc);
  doAnswer();
};
const handleRemoteAnswer = (message) => {
  console.log("handleRemoteAnswer=====", message);
  const desc = JSON.parse(message.msg);
  peerConn.setRemoteDescription(desc);
};
const handleRemoteCandidate = (message) => {
  console.log("handleRemoteCandidate=====", message);
  const candidate = JSON.parse(message.msg)
  peerConn.addIceCandidate(candidate).catch(err => {
    console.log('addIceCandidate fail:', err)
  })
};
const doAnswer = () => {
  peerConn
    .createAnswer()
    .then((session) => {
      console.log("createAnswer.....", session);
      // createAnswerAndSendMessage
      peerConn
        .setLocalDescription(session)
        .then(() => {
          const jsonMsg = {
            cmd: "answer",
            roomId: roomId.value,
            uid: localUserId,
            remoteUid: remoteUserId,
            msg: JSON.stringify(session),
          };
          console.log("发送answer到远端...", jsonMsg);
          broadCaster.sendMessage(jsonMsg);
        })
        .catch((err) => {
          console.error("answer setLocalDescription failed:", err);
        });
    })
    .catch((err) => {
      console.error("createAnswer failed:", err);
    });
};
const createOffer = () => {
  // 创建RTCPeerConnection
  if (!peerConn) {
    peerConn = createPeerConnection();
  }
  peerConn
    .createOffer()
    .then((session) => {
      console.log("createOffer.....", session);
      // createOfferAndSendMessage
      peerConn
        .setLocalDescription(session)
        .then(() => {
          const jsonMsg = {
            cmd: "offer",
            roomId: roomId.value,
            uid: localUserId,
            remoteUid: remoteUserId,
            msg: JSON.stringify(session),
          };
          console.log("发送offer到远端...", jsonMsg);
          broadCaster.sendMessage(jsonMsg);
        })
        .catch((err) => {
          console.error("offer setLocalDescription failed:", err);
        });
    })
    .catch((err) => {
      console.error("createOffer failed:", err);
    });
};
const doJoin = (roomId) => {
  const jsonMsg = {
    cmd: "join",
    roomId: roomId,
    uid: localUserId,
  };
  broadCaster.sendMessage(jsonMsg);
};

joinBtn.onclick = () => {
  console.log("点击加入按钮");
  if (!roomId.value) {
    alert("请输入房间ID");
    return;
  }
  // 初始化本地码流
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
    })
    .then((stream) => {
      console.log("stream...", stream);
      doJoin(roomId.value);
      localVideo.srcObject = stream;
      localStream = stream;
    })
    .catch((e) => {
      console.error("获取本地码流失败：", e);
    });
};

leaveBtn.onclick = () => {
  const jsonMsg = {
    cmd: SIGNAL_TYPE_LEAVE,
    roomId: roomId.value,
    uid: localUserId,
  };
  broadCaster.sendMessage(jsonMsg);
};
