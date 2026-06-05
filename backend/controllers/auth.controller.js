const registerUser = async (req, res) => {
    res.json({ message: "register" });
};

const loginUser = async (req, res) => {
    res.json({ message: "login" });
};

module.exports = {
    registerUser,
    loginUser
};