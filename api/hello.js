module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({ 
    message: 'Hello World!',
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
};