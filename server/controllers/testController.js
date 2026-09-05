const testController = (req, res) => {
    res.json({
        message: "Hello from Express backend!",
    });
};

module.exports = testController;