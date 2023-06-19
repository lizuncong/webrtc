const defaultConfiguration = {
  // bundlePolicy: "max-bundle",
  // rtcpMuxPolicy: "require",
  // iceTransportPolicy: "relay", // 先设置为relay，只有relay中继模式可用的时候，才能部署到公网。部署到公网后也先测试relay
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:global.stun.twilio.com:3478",
      ],
    },
  ],
};
if (location.search.includes("isReceive")) {
  initior.style.display = "none";
} else {
  receiver.style.display = "none";
}
let localConnection;
let remoteConnection;
let localCandidates = [];
let remoteCandidates = [];
let sendChannel;
let receiveChannel;
initialBtn.onclick = async () => {
  localConnection = new RTCPeerConnection(defaultConfiguration);
  sendChannel = localConnection.createDataChannel("sendChannel");
  sendChannel.onopen = (event) => {
    console.log("send channel open=====", event, sendChannel);
  };
  sendChannel.onclose = (event) => {
    console.log("send channel close======", event);
  };
  sendChannel.onmessage = event => {
    console.log('接收到消息..', event.data)
  }
  localConnection.onicecandidate = (e) => {
    console.log("local on icecandidate=====", e.candidate);
    if (e.candidate) {
      localCandidates.push(e.candidate);
      localCandidate.value = JSON.stringify(localCandidates);
    }
  };
  const offer = await localConnection.createOffer();
  console.log('local offer=====', offer)
  const res = await localConnection.setLocalDescription(offer);
  console.log('set local desc...', res)
  localOffer.value = JSON.stringify(offer);
};
confirmAnswer.onclick = async () => {
  await localConnection.setRemoteDescription(JSON.parse(remoteAnswer.value));
};
confirmRemoteCandidate.onclick = async () => {
  const candidates = JSON.parse(remoteCandidate.value);
  candidates.forEach((can) => {
    localConnection.addIceCandidate(can);
  });
};
confirmLocalCandidate.onclick = async () => {
  const candidates = JSON.parse(initialCandidate.value);
  candidates.forEach((can) => {
    remoteConnection.addIceCandidate(can);
  });
};
confirmOffer.onclick = async () => {
  remoteConnection = new RTCPeerConnection(defaultConfiguration);
  remoteConnection.ondatachannel = (e) => {
    console.log("on data channel=====", e);
    receiveChannel = event.channel;
    receiveChannel.onmessage = (e) => {
      console.log("接收到消息。。。。", e.data);
      receiveChannel.send('接收到消息')
    };
    receiveChannel.onopen = (e) => {
      console.log("data channel 打开。。", e);
    };
    receiveChannel.onclose = (e) => {
      console.log("data channel 关闭。。。", e);
    };
  };
  remoteConnection.onicecandidate = (e) => {
    console.log("remote on icecandidate=======", e.candidate);
    if (e.candidate) {
      remoteCandidates.push(e.candidate);
      receiveCandidate.value = JSON.stringify(remoteCandidates);
    }
  };
  const res = await remoteConnection.setRemoteDescription(
    JSON.parse(initialOffer.value)
  );
  const answer = await remoteConnection.createAnswer();
  console.log('answer....', answer)
  const res2 = await remoteConnection.setLocalDescription(answer);
  console.log('set answer...', res2)
  recevieAnswer.value = JSON.stringify(answer);
};

sendBtn.onclick = () => {
  sendChannel.send("hello world");
};
