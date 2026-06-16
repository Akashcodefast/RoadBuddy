const notificationService = {

  onRequestAccepted: (socket, cb) => {
    socket.on("request_accepted", cb);
  },

  onHelperLocation: (socket, cb) => {
    socket.on("helper_location", cb);
  },

  onRequestCompleted: (socket, cb) => {
    socket.on("request_completed", cb);
  },

  onAcceptFailed: (socket, cb) => {
    socket.on("accept_failed", cb);
  },

  // ← NEW: listen for SOS alerts
  onSOSAlert: (socket, cb) => {
    socket.on("sos_alert", cb);
  },

  sendHelperLocation: (socket, { userId, lat, lng }) => {
    socket.emit("update_location", { userId, lat, lng });
  },

  linkToRequester: (socket, requesterId) => {
    socket.emit("link_requester", { requesterId });
  },

  cleanup: (socket) => {
    socket.off("request_accepted");
    socket.off("helper_location");
    socket.off("request_completed");
    socket.off("accept_failed");
    socket.off("sos_alert"); // ← NEW
  },

};

export default notificationService;