以下是一个通过webrtc或websocket广播数据的JavaScript SDK的设计示例：

```javascript
class Broadcaster {
  constructor() {
    this.websocket = null;
    this.peerConnection = null;
    this.dataChannel = null;
  }
  
  // 初始化websocket连接
  initWebsocket(url) {
    this.websocket = new WebSocket(url);
    this.websocket.onopen = () => {
      console.log('WebSocket connection established');
    };
    this.websocket.onerror = (e) => {
      console.error('WebSocket connection error:', e);
    };
    this.websocket.onclose = () => {
      console.log('WebSocket connection closed');
      // 若webrtc连接尚未建立，则重新连接websocket
      if (!this.peerConnection) {
        setTimeout(() => {
          this.initWebsocket(url);
        }, 1000);
      }
    };
  }
  
  // 初始化webrtc连接
  async initWebRTC() {
    // 获取本地媒体流
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
    // 创建peerConnection对象
    this.peerConnection = new RTCPeerConnection();
    // 创建dataChannel对象
    this.dataChannel = this.peerConnection.createDataChannel('data');
    // 监听dataChannel的open事件
    this.dataChannel.onopen = () => {
      console.log('WebRTC data channel opened');
    };
    // 添加本地媒体流到peerConnection中
    localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, localStream);
    });
    // 创建offer并发送给对端
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    // 将offer通过websocket发送给对端
    this.websocket.send(JSON.stringify({ type: 'offer', data: offer }));
  }
  
  // 发送数据
  send(data) {
    if (this.peerConnection && this.peerConnection.signalingState === 'stable') { // webrtc连接已建立
      this.dataChannel.send(data);
    } else { // webrtc连接未建立，则通过websocket发送
      this.websocket.send(JSON.stringify({ type: 'message', data }));
    }
  }
  
  // 处理消息
  handleMsg(msg) {
    if (msg.type === 'offer') { // 收到offer
      if (!this.peerConnection) {
        this.initWebRTC();
      }
      // 设置远端描述
      const offer = new RTCSessionDescription(msg.data);
      this.peerConnection.setRemoteDescription(offer);
      // 创建answer并发送给对端
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      // 将answer通过websocket发送给对端
      this.websocket.send(JSON.stringify({ type: 'answer', data: answer }));
    } else if (msg.type === 'answer') { // 收到answer
      // 设置远端描述
      const answer = new RTCSessionDescription(msg.data);
      this.peerConnection.setRemoteDescription(answer);
    } else if (msg.type === 'message') { // 收到消息
      console.log('Received message:', msg.data);
    }
  }
  
  // 关闭连接
  close() {
    if (this.websocket) {
      this.websocket.close();
    }
    if (this.dataChannel) {
      this.dataChannel.close();
    }
    if (this.peerConnection) {
      this.peerConnection.close();
    }
  }
}
```

使用示例：

```javascript
const broadcaster = new Broadcaster();

// 初始化连接
const url = 'ws://localhost:8080';
broadcaster.initWebsocket(url);

// 发送数据
broadcaster.send('Hello world');

// 关闭连接
broadcaster.close();
```

在以上示例中，我们使用WebSocket实现了一个最基本的数据广播功能。如果WebRTC连接成功，则使用WebRTC广播，否则仍然使用WebSocket进行广播。

具体来说，我们首先在Broadcaster类中创建了一个websocket对象，然后通过initWebsocket方法初始化WebSocket连接。在initWebsocket方法中，我们监听WebSocket的open、error和close事件，并在连接关闭后尝试重新连接WebSocket。如果WebSocket连接尚未建立，则通过setTimeout方法等待一定时间后重新连接。

接着，在initWebRTC方法中，我们初始化了WebRTC连接。首先获取本地媒体流，然后创建peerConnection和dataChannel对象，并将本地媒体流添加到peerConnection中。接着，创建offer并将其发送给对端。这里我们采用了JSON数据格式，通过WebSocket将offer发送
