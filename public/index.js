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
const peer = new RTCPeerConnection();
// handleIceCandidate
peer.onicecandidate = (event) => {
  const candidate = event.candidate;
  console.log("onicecandidate======", candidate);
  if (candidate) {
    localIcecandidateTxt.value = JSON.stringify(candidate);
  }
};

// handleRemoteStreamAdd
// peer.ontrack = (event) => {
//   console.log("ontrack...", event.streams);
//   remoteStream = event.streams[0];
//   remoteVideo.srcObject = remoteStream;
// };
peer.onconnectionstatechange = () => {
  console.log("onconnectionstatechange..", peer.connectionState);
};
peer.oniceconnectionstatechange = () => {
  console.log("oniceconnectionstatechange.", peer.iceConnectionState);
};

let sendChannel;
sendBtn.onclick = () => {
  sendChannel.send("hello world");
};

// 1.呼叫者创建一个提议，并将提议设置为本地描述
initialBtn.onclick = () => {
  sendChannel = peer.createDataChannel("sendChannel"); //创建 RTCDataChannel对象
  //当有文本数据来时，回调该函数。
  sendChannel.onmessage = (event) => {
    console.log("data channel message...", event);
  };
  sendChannel.onopen = (event) => {
    console.log("send channel打开...", event);
  };
  sendChannel.onclose = (event) => {
    console.log("send channel关闭...", event);
  };
  peer
    .createOffer()
    .then((sessionDescription) => {
      console.log("createOffer.....", sessionDescription);
      peer
        .setLocalDescription(sessionDescription)
        .then((res) => {
          offserTxt.value = JSON.stringify(sessionDescription);
          console.log("setLocalDescription====", res);
        })
        .catch((err) => {
          console.error("offer setLocalDescription failed:", err);
        });
    })
    .catch((err) => {
      console.error("createOffer failed:", err);
    });
};

// 2.接收者收到offer并将其记录为远程描述
offerBtn.onclick = () => {
  const offser = JSON.parse(offserTxt.value);
  //当对接创建数据通道时会回调该方法。
  peer.ondatachannel = (event) => {
    console.log("ondatachannel=", event);
    const receiveChannel = event.channel;
    receiveChannel.onmessage = (event) => {
      console.log("data channel接收到消息。。。", event);
    };
    receiveChannel.onopen = (event) => {
      console.log("data channel连接打开...", event);
    };
    receiveChannel.onclose = (event) => {
      console.log("data channel连接关闭", event);
    };
  };
  peer.setRemoteDescription(offser);

  const candidate = JSON.parse(icecandidateTxt.value);
  peer
    .addIceCandidate(candidate)
    .then((res) => {
      console.log("添加候选人成功...", res);
    })
    .catch((err) => {
      console.log("addIceCandidate 错误", err);
    });

  // 3.接收者创建Answer
  peer
    .createAnswer()
    .then((session) => {
      console.log("createAnswer.....", session);
      peer
        .setLocalDescription(session)
        .then((res) => {
          answerTxt.value = JSON.stringify(session);
          console.log("设置本地anser成功", res);
        })
        .catch((err) => {
          console.error("answer setLocalDescription failed:", err);
        });
    })
    .catch((err) => {
      console.error("createAnswer failed:", err);
    });
};

// 3.呼叫者接受到answer并设为远程描述
answerBtn.onclick = () => {
  const answer = JSON.parse(answerTxt.value);
  peer.setRemoteDescription(answer).then((res) => {
    console.log("设置远程描述成功....", res);
  });
  const candidate = JSON.parse(icecandidateTxt.value);
  peer
    .addIceCandidate(candidate)
    .then((res) => {
      console.log("添加候选人成功...", res);
    })
    .catch((err) => {
      console.log("addIceCandidate 错误", err);
    });
};

// 设立ICE候选人
icecandidateBtn.onclick = () => {
  const candidate = JSON.parse(icecandidateTxt.value);
  peer
    .addIceCandidate(candidate)
    .then((res) => {
      console.log("添加候选人成功...", res);
    })
    .catch((err) => {
      console.log("addIceCandidate 错误", err);
    });
};
