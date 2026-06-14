// handles all socket-based notification logic for tracking

const notificationService = {

  // listen for helper accepted — call cb with helper data
  onRequestAccepted: (socket, cb) => {
    socket.on("request_accepted", cb);
  },

  // listen for helper location updates
  onHelperLocation: (socket, cb) => {
    socket.on("helper_location", cb);
  },

  // listen for request completed
  onRequestCompleted: (socket, cb) => {
    socket.on("request_completed", cb);
  },

  // listen for accept failed (race condition)
  onAcceptFailed: (socket, cb) => {
    socket.on("accept_failed", cb);
  },

  // helper sends their location to requester
  sendHelperLocation: (socket, { userId, lat, lng }) => {
    socket.emit("update_location", { userId, lat, lng });
  },

  // helper links themselves to requester for live tracking
  linkToRequester: (socket, requesterId) => {
    socket.emit("link_requester", { requesterId });
  },

  // remove all tracking listeners
  cleanup: (socket) => {
    socket.off("request_accepted");
    socket.off("helper_location");
    socket.off("request_completed");
    socket.off("accept_failed");
  },

};

export default notificationService;