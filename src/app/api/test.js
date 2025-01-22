// pages/api/test.js
export default async function handler(req, res) {
    try {
      // Just a simple test response for now
      return res.status(200).json({ message: "API is working!" });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }