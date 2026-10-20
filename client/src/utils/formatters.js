export function formatVND(amount) {
  const num = Math.round(Number(amount) || 0);
  return `${num.toLocaleString('vi-VN')}đ`;
}

export function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}
