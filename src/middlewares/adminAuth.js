// src/middlewares/adminAuth.js
export function adminAuth(req, res, next) {
  const token = req.header('x-admin-token');
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ success:false, error:'Unauthorized' });
  }
  next();
}
