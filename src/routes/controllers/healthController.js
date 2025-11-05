export const healthCheck = (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
};
