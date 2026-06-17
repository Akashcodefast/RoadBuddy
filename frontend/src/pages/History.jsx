import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import useAuth                 from "../hooks/useAuth";
import api                     from "../services/api";

const ISSUE_EMOJI = {
  Fuel:      "⛽",
  Tyre:      "🔩",
  Battery:   "🔋",
  Breakdown: "🔧",
  Other:     "🆘",
};

const STATUS_STYLE = {
  pending:   { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", label: "Pending"   },
  accepted:  { color: "text-blue-400",   bg: "bg-blue-500/10   border-blue-500/30",   label: "Accepted"  },
  ongoing:   { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", label: "Ongoing"   },
  completed: { color: "text-green-400",  bg: "bg-green-500/10  border-green-500/30",  label: "Completed" },
  cancelled: { color: "text-gray-400",   bg: "bg-gray-800      border-gray-700",      label: "Cancelled" },
};

// star rating component
const StarRating = ({ value, onChange, readonly = false }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={readonly}
          onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`text-2xl transition ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
        >
          {star <= (hovered || value) ? "⭐" : "☆"}
        </button>
      ))}
    </div>
  );
};

// rating modal
const RatingModal = ({ request, currentUser, onClose, onSubmit }) => {
  const [stars,  setStars ] = useState(5);
  const [review, setReview] = useState("");
  const [loading,setLoading] = useState(false);

  // who am I rating?
  const isRequester = request.userId?._id === currentUser._id ||
                      request.userId       === currentUser._id;

  const ratingTarget = isRequester ? request.helperId : request.userId;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({
        requestId:  request._id,
        receiverId: ratingTarget?._id || ratingTarget,
        stars,
        review,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-6">

        <h2 className="text-lg font-bold mb-1">Rate your experience</h2>
        <p className="text-gray-400 text-sm mb-5">
          How was your experience with{" "}
          <span className="text-white font-semibold">
            {ratingTarget?.name || "this user"}
          </span>?
        </p>

        {/* stars */}
        <div className="flex justify-center mb-4">
          <StarRating value={stars} onChange={setStars} />
        </div>

        {/* review */}
        <textarea
          rows={3}
          placeholder="Write a review (optional)..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition resize-none mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 text-gray-300 font-semibold py-3 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
          >
            {loading ? "Submitting..." : "Submit ⭐"}
          </button>
        </div>

      </div>
    </div>
  );
};

const History = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [requests,      setRequests     ] = useState([]);
  const [loading,       setLoading      ] = useState(true);
  const [ratingRequest, setRatingRequest] = useState(null);
  const [filter,        setFilter       ] = useState("all");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/users/history");
        setRequests(res.data);
      } catch (err) {
        console.error("Fetch history error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleRatingSubmit = async ({ requestId, receiverId, stars, review }) => {
    try {
      await api.post("/ratings/create", { requestId, receiverId, stars, review });
      // refresh history
      const res = await api.get("/users/history");
      setRequests(res.data);
    } catch (err) {
      console.error("Rating error:", err.message);
    }
  };

  const filtered = filter === "all"
    ? requests
    : requests.filter((r) => r.status === filter);

  const isRequester = (req) =>
    req.userId?._id === user._id || req.userId === user._id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-orange-500 animate-pulse font-bold">
          Loading history...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-6">
      <div className="max-w-lg mx-auto">

        {/* header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-400 hover:text-white transition text-xl"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold">Request History</h1>
            <p className="text-gray-400 text-sm">
              {requests.length} total requests
            </p>
          </div>
        </div>

        {/* filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {["all", "completed", "pending", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                filter === f
                  ? "bg-orange-500 text-white"
                  : "bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-600"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-400 font-semibold">No requests found</p>
            <p className="text-gray-600 text-sm mt-1">
              {filter === "all"
                ? "You haven't made or helped with any requests yet"
                : `No ${filter} requests`}
            </p>
          </div>
        )}

        {/* request list */}
        <div className="space-y-4">
          {filtered.map((req) => {
            const style     = STATUS_STYLE[req.status] || STATUS_STYLE.cancelled;
            const amRequester = isRequester(req);
            const canRate   = req.status === "completed" && !req.myRating &&
                              (amRequester ? !!req.helperId : !!req.userId);

            return (
              <div
                key={req._id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
              >
                {/* top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {ISSUE_EMOJI[req.issueType] || "🆘"}
                    </div>
                    <div>
                      <p className="font-bold">{req.issueType}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(req.createdAt).toLocaleDateString("en-IN", {
                          day:   "numeric",
                          month: "short",
                          year:  "numeric",
                          hour:  "2-digit",
                          minute:"2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${style.bg} ${style.color}`}>
                    {style.label}
                  </span>
                </div>

                {/* role badge */}
                <div className="mb-3">
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                    amRequester
                      ? "bg-orange-500/10 text-orange-400"
                      : "bg-green-500/10  text-green-400"
                  }`}>
                    {amRequester ? "🆘 You requested help" : "🤝 You helped"}
                  </span>
                </div>

                {/* description */}
                {req.description && (
                  <p className="text-gray-400 text-sm mb-3">"{req.description}"</p>
                )}

                {/* other party */}
                {amRequester && req.helperId && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-green-500/20 rounded-full flex items-center justify-center text-xs font-bold text-green-400">
                      {req.helperId.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Helper: {req.helperId.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        ⭐ {req.helperId.rating || "New"}
                      </p>
                    </div>
                  </div>
                )}

                {!amRequester && req.userId && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-orange-500/20 rounded-full flex items-center justify-center text-xs font-bold text-orange-400">
                      {req.userId.name?.[0]?.toUpperCase()}
                    </div>
                    <p className="text-sm font-medium">
                      Helped: {req.userId.name}
                    </p>
                  </div>
                )}

                {/* my rating */}
                {req.myRating && (
                  <div className="bg-gray-800 rounded-xl p-3 mb-3">
                    <p className="text-gray-400 text-xs mb-1">Your rating</p>
                    <StarRating value={req.myRating.stars} readonly />
                    {req.myRating.review && (
                      <p className="text-gray-400 text-xs mt-1">
                        "{req.myRating.review}"
                      </p>
                    )}
                  </div>
                )}

                {/* action buttons */}
                <div className="flex gap-2 mt-2">
                  {req.status === "accepted" && (
                    <button
                      onClick={() => navigate(`/track/${req._id}`)}
                      className="flex-1 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold py-2 rounded-xl transition"
                    >
                      📍 Track
                    </button>
                  )}
                  {req.status === "accepted" && (
                    <button
                      onClick={() => navigate(`/chat/${req._id}`)}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold py-2 rounded-xl transition"
                    >
                      💬 Chat
                    </button>
                  )}
                  {canRate && (
                    <button
                      onClick={() => setRatingRequest(req)}
                      className="flex-1 bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 text-yellow-400 text-sm font-semibold py-2 rounded-xl transition"
                    >
                      ⭐ Rate
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* rating modal */}
      {ratingRequest && (
        <RatingModal
          request={ratingRequest}
          currentUser={user}
          onClose={() => setRatingRequest(null)}
          onSubmit={handleRatingSubmit}
        />
      )}

    </div>
  );
};

export default History;