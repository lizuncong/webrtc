const ws = require("nodejs-websocket");

const SIGNAL_TYPE_JOIN = "join";
const SIGNAL_TYPE_RESP_JOIN = "resp-join";
const SIGNAL_TYPE_LEAVE = "leave";
const SIGNAL_TYPE_NEW_PEER = "new-peer";
const SIGNAL_TYPE_PEER_LEAVE = "peer-leave";
const SIGNAL_TYPE_OFFER = "offer";
const SIGNAL_TYPE_ANSWER = "answer";
const SIGNAL_TYPE_CANDIDATE = "candidate";
const port = 8088;

const roomMap = {}; // { roomId: { uid: conn }}
const handleJoin = (message, conn) => {
  const { roomId, uid } = message;
  console.log("加入房间...", roomId, uid);
  let room = roomMap[roomId];
  if (!room) {
    room = roomMap[roomId] = {};
  }
  if (Object.keys(room).length >= 2) {
    console.error("roomId:", roomId, "已经存在两个人，请使用其他房间");
    return;
  }
  room[uid] = conn;
  const uids = Object.keys(room);
  // 对于房间中的所有用户
  // 1.将当前新连接的用户信息广播给其他客户端
  // 2.将当前房间内的所有用户信息广播给新连接的客户端
  if (uids.length > 1) {
    uids.forEach((remoteUid) => {
      if (remoteUid === uid) return;
      // 将当前用户的信息广播到其他客户端
      let jsonMsg = {
        cmd: SIGNAL_TYPE_NEW_PEER,
        remoteUid: uid,
      };
      console.log("将当前新连接的用户信息广播给其他客户端..", jsonMsg);
      room[remoteUid].sendText(JSON.stringify(jsonMsg));

      jsonMsg = {
        cmd: SIGNAL_TYPE_RESP_JOIN,
        remoteUid,
      };
      console.log("将当前房间内的所有用户信息广播给新连接的客户端..", jsonMsg);
      conn.sendText(JSON.stringify(jsonMsg));
    });
  }
};

const handleLeave = (message) => {
  const { roomId, uid } = message;
  console.log("uid:", uid, " leave room:", roomId);
  const room = roomMap[roomId];
  if (!room) {
    console.log("handle leave 没找到roomId ", roomId);
    return;
  }
  delete room[uid];
  const restUids = Object.keys(room);
  // 将离开的用户信息广播给房间内的其他人
  if (restUids.length) {
    restUids.forEach((remoteUid) => {
      const jsonMsg = {
        cmd: SIGNAL_TYPE_PEER_LEAVE,
        remoteUid: uid,
      };
      const conn = room[remoteUid];
      console.log("将离开的用户信息广播给房间内的其他人", jsonMsg);
      conn && conn.sendText(JSON.stringify(jsonMsg));
    });
  }
};

const handleOffer = (message) => {
  const { roomId, uid, remoteUid } = message;
  console.log("uid:", uid, " handle Offer:", roomId, remoteUid);
  const room = roomMap[roomId];
  if (!room) {
    console.log("handle offer 没找到roomId ", roomId);
    return;
  }
  if(!room[uid]){
    console.log('handle offer 没找到用户:', uid)
    return
  }
  const remoteConn = room[remoteUid];
  if(remoteConn){
    remoteConn.sendText(JSON.stringify(message))
  } else{
    console.error('handle offer没找到 remote uid:', remoteUid)
  }
}

const handleAnswer = (message) => {
  const { roomId, uid, remoteUid } = message;
  console.log("uid:", uid, " handle answer:", roomId);
  const room = roomMap[roomId];
  if (!room) {
    console.log("handle answer 没找到roomId ", roomId);
    return;
  }
  if(!room[uid]){
    console.log('handle answer 没找到用户:', uid)
    return
  }
  const remoteConn = room[remoteUid];
  if(remoteConn){
    remoteConn.sendText(JSON.stringify(message))
  } else{
    console.error('handle answerr没找到 remote uid:', remoteUid)
  }
}

const handleCandidate = (message) => {
  const { roomId, uid, remoteUid } = message;
  console.log("uid:", uid, " handle candidate:", roomId);
  const room = roomMap[roomId];
  if (!room) {
    console.log("handle candidate 没找到roomId ", roomId);
    return;
  }
  if(!room[uid]){
    console.log('handle candidate 没找到用户:', uid)
    return
  }
  const remoteConn = room[remoteUid];
  if(remoteConn){
    remoteConn.sendText(JSON.stringify(message))
  } else{
    console.error('handle candidate没找到 remote uid:', remoteUid)
  }
}

const server = ws
  .createServer((conn) => {
    console.log("创建一个新的连接========");
    conn.on("text", (str) => {
      console.log("recv msg:", str);
      const jsonMsg = JSON.parse(str);

      switch (jsonMsg.cmd) {
        case SIGNAL_TYPE_JOIN:
          handleJoin(jsonMsg, conn);
          break;
        case SIGNAL_TYPE_LEAVE:
          handleLeave(jsonMsg);
          break;
        case SIGNAL_TYPE_OFFER:
          handleOffer(jsonMsg);
          break;
        case SIGNAL_TYPE_ANSWER:
          handleAnswer(jsonMsg);
          break;
        case SIGNAL_TYPE_CANDIDATE:
          handleCandidate(jsonMsg);
          break;
        default:
          console.error("无法识别的指令");
      }
    });
    conn.on("close", (code, reason) => {
      console.log("连接关闭", code, "reason:", reason);
    });
    conn.on("error", (err) => {
      console.log("监听到错误", err);
    });
  })
  .listen(port);
