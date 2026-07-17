function success(res, data = {}, message = '', status = 200) {
  const payload = { success: true };
  if (message) payload.message = message;
  return res.status(status).json({ ...payload, ...data });
}

function error(res, message, status = 400) {
  return res.status(status).json({ success: false, message });
}

module.exports = { success, error };
