let localStream = null;

joinBtn.onclick = () => {
  console.log("点击加入按钮");
  // 初始化本地码流
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
    })
    .then((stream) => {
      console.log("stream...", stream);
      localVideo.srcObject = stream;
      localStream = stream;
    })
    .catch((e) => {
      console.error("获取本地码流失败：", e);
    });
};
