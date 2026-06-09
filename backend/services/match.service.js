const User = require("../models/User");

const findNearbyUsers = async (requesterId, lat, lng) => {
  const nearby = await User.aggregate([
    {
      $geoNear: {
        near: {
          type:        "Point",
          coordinates: [lng, lat], // ⚠️ MongoDB = [lng, lat]
        },
        distanceField: "distance",  // metres
        maxDistance:   5000,        // 5 km
        spherical:     true,
      },
    },
    {
      $match: {
        _id:      { $ne:  requesterId },
        isOnline: { $eq:  true },
        isBusy:   { $eq:  false },
      },
    },
    { $sort:  { distance: 1 } },
    { $limit: 10 },
  ]);

  return nearby;
};

module.exports = { findNearbyUsers };