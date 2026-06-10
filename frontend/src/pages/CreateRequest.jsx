import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ISSUE_TYPES = [
    { type: "Fuel", emoji: "⛽", label: "No Fuel", desc: "Ran out of fuel" },
    { type: "Tyre", emoji: "🔩", label: "Flat Tyre", desc: "Puncture or flat tyre" },
    { type: "Battery", emoji: "🔋", label: "Dead Battery", desc: "Battery discharged" },
    { type: "Breakdown", emoji: "🔧", label: "Breakdown", desc: "Engine or mechanical" },
    { type: "Other", emoji: "🆘", label: "Other", desc: "Any other emergency" },
];

const CreateRequest = () => {
    const navigate = useNavigate();

    const [selected, setSelected] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [locating, setLocating] = useState(false);

    const handleSubmit = async () => {
        if (!selected) {
            setError("Please select an issue type");
            return;
        }

        setError("");
        setLocating(true);

        // get GPS location
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                setLocating(false);
                setLoading(true);

                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;

                try {
                    const res = await api.post("/requests/create", {
                        issueType: selected,
                        lat,
                        lng,
                        description,
                    });

                    if (res.data.success) {
                        // go to tracking page with requestId
                        navigate(`/track/${res.data.requestId}`);
                    } else {
                        setError(res.data.message);
                    }

                } catch (err) {
                    setError(err.response?.data?.message || "Failed to create request");
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                setLocating(false);
                setError("Location access denied. Please enable GPS.");
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
            <div className="max-w-lg mx-auto">

                {/* header */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="text-gray-400 hover:text-white transition text-xl"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">Request Help</h1>
                        <p className="text-gray-400 text-sm">Select your issue type</p>
                    </div>
                </div>

                {/* error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* issue type grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {ISSUE_TYPES.map((item) => (
                        <button
                            key={item.type}
                            onClick={() => setSelected(item.type)}
                            className={`p-4 rounded-xl border text-left transition ${selected === item.type
                                    ? "border-orange-500 bg-orange-500/10"
                                    : "border-gray-800 bg-gray-900 hover:border-gray-600"
                                }`}
                        >
                            <div className="text-2xl mb-2">{item.emoji}</div>
                            <div className="font-semibold text-sm">{item.label}</div>
                            <div className="text-gray-400 text-xs mt-1">{item.desc}</div>
                        </button>
                    ))}
                </div>

                {/* description */}
                <div className="mb-6">
                    <label className="text-gray-400 text-sm mb-2 block">
                        Additional details (optional)
                    </label>
                    <textarea
                        rows={3}
                        placeholder="E.g. I'm on NH48 near the toll plaza..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition resize-none"
                    />
                </div>

                {/* submit */}
                <button
                    onClick={handleSubmit}
                    disabled={loading || locating}
                    className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition text-lg"
                >
                    {locating ? "📍 Getting your location..." :
                        loading ? "Sending request..." :
                            "🆘 Request Help Now"}
                </button>

                {/* info */}
                <p className="text-center text-gray-500 text-xs mt-4">
                    Top 10 nearby users within 5km will be notified instantly
                </p>

            </div>
        </div>
    );
};

export default CreateRequest;