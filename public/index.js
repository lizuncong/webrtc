let localConnection;
let remoteConnection;
let localCandidates = [];
let remoteCandidates = [];
let sendChannel;
let receiveChannel;
initialBtn.onclick = async () => {
  localConnection = new RTCPeerConnection();
  sendChannel = localConnection.createDataChannel("sendChannel");
  sendChannel.onopen = (event) => {
    console.log("send channel open=====", event, sendChannel);
  };
  sendChannel.onclose = (event) => {
    console.log("send channel close======", event);
  };
  localConnection.onicecandidate = (e) => {
    console.log("local on icecandidate=====", e);
    if (e.candidate) {
      localCandidates.push(e.candidate);
      localCandidate.value = JSON.stringify(localCandidates);
    }
  };
  const offer = await localConnection.createOffer();
  const res = await localConnection.setLocalDescription(offer);
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
  remoteConnection = new RTCPeerConnection();
  remoteConnection.ondatachannel = (e) => {
    console.log("on data channel=====", e);
    receiveChannel = event.channel;
    receiveChannel.onmessage = (e) => {
      console.log('接收到消息。。。。', e)
    };
    receiveChannel.onopen = (e) => {
      console.log('data channel 打开。。', e)
    };
    receiveChannel.onclose = (e) => {
      console.log('data channel 关闭。。。', e)
    };
  };
  remoteConnection.onicecandidate = (e) => {
    console.log("remote on icecandidate=======", e);
    if (e.candidate) {
      remoteCandidates.push(e.candidate);
      receiveCandidate.value = JSON.stringify(remoteCandidates);
    }
  };
  const res = await remoteConnection.setRemoteDescription(
    JSON.parse(initialOffer.value)
  );
  const answer = await remoteConnection.createAnswer();
  const res2 = await remoteConnection.setLocalDescription(answer);
  recevieAnswer.value = JSON.stringify(answer);
};

sendBtn.onclick = () => {
  sendChannel.send('hello world')
};
