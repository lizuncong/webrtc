const SIGNAL_TYPE_JOIN = "join";
const SIGNAL_TYPE_RESP_JOIN = "resp-join";
const SIGNAL_TYPE_LEAVE = "leave";
const SIGNAL_TYPE_NEW_PEER = "new-peer";
const SIGNAL_TYPE_PEER_LEAVE = "peer-leave";
const SIGNAL_TYPE_OFFER = "offer";
const SIGNAL_TYPE_ANSWER = "answer";
const SIGNAL_TYPE_CANDIDATE = "candidate";

let localStream = null;
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
    // createOffer();
  }
  handleRemoteRespJoin(msg) {
    console.log('加入房间成功，房间内其他成员信息：', msg)
  }
}

const broadCaster = new BroadCaster("ws://localhost:8088");

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
