/**
 * Generates dynamic VietQR image URL pre-filling calculated amount and transfer description
 * Specification: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-compact.png?amount=<FINAL_AMOUNT>&addInfo=<ROOM_ID>%20<MEMBER_NAME>
 */
export function generateVietQRUrl({ bankId, accountNo, amount, roomId, memberName }) {
  const bank = encodeURIComponent(bankId || 'MB');
  const account = encodeURIComponent(accountNo || '0987654321');
  const finalAmount = Math.max(0, Math.round(Number(amount) || 0));
  
  // Format transfer description: e.g. "ROOM-8888 THAI BAO"
  const cleanRoom = (roomId || 'ROOM').replace(/[^A-Za-z0-9_-]/g, '');
  const cleanMember = (memberName || 'MEMBER').replace(/[^A-Za-z0-9_ -]/g, '').trim();
  const addInfo = encodeURIComponent(`${cleanRoom} ${cleanMember}`.substring(0, 25));

  return `https://img.vietqr.io/image/${bank}-${account}-compact.png?amount=${finalAmount}&addInfo=${addInfo}`;
}
