module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({ 
    success: true,
    message: 'FINALLY WORKING! 🎉',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  });
};