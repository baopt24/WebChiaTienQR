import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Persistent JSON file path inside server/data/
const DATA_DIR = path.resolve(__dirname, '../../data');
const HISTORY_FILE = path.join(DATA_DIR, 'order_history.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Clean and normalize IP (strip IPv6 mapping e.g. ::ffff:172.26.x.x -> 172.26.x.x)
export function cleanIp(rawIp) {
  if (!rawIp) return '127.0.0.1';
  let ip = String(rawIp).trim();
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  if (ip === '::1' || ip === 'localhost') {
    ip = '127.0.0.1';
  }
  return ip;
}

// Read all history records
export function loadAllHistory() {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      fs.writeFileSync(HISTORY_FILE, '[]', 'utf-8');
      return [];
    }
    const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading order history:', err);
    return [];
  }
}

// Save all history records
function writeAllHistory(list) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing order history:', err);
  }
}

/**
 * When the last member pays (100% completed), record history for every participant based on their device IP
 */
export function saveCompletedRoomHistory(room) {
  if (!room || !room.billSummary || !room.billSummary.memberBills) return [];

  const existingHistory = loadAllHistory();
  const completedAt = new Date().toISOString();
  const newRecords = [];

  // Map member names to their client IPs recorded during socket join
  const memberIpMap = {};
  (room.members || []).forEach(m => {
    if (m.name) {
      memberIpMap[m.name.toLowerCase()] = cleanIp(m.clientIp);
    }
  });

  // Also check items' client IPs if available
  (room.items || []).forEach(it => {
    if (it.userName && it.clientIp && !memberIpMap[it.userName.toLowerCase()]) {
      memberIpMap[it.userName.toLowerCase()] = cleanIp(it.clientIp);
    }
  });

  const hostIp = cleanIp(room.hostIp || memberIpMap[room.hostName.toLowerCase()]);

  room.billSummary.memberBills.forEach((mb, index) => {
    const memberName = mb.userName || 'Thành viên';
    const clientIp = memberIpMap[memberName.toLowerCase()] || hostIp || '127.0.0.1';
    const isHost = memberName.toLowerCase() === room.hostName.toLowerCase();

    // Avoid duplicate entry for the exact same room + member
    const alreadySaved = existingHistory.some(
      h => h.roomId === room.id && h.userName.toLowerCase() === memberName.toLowerCase()
    );

    if (alreadySaved) return;

    const record = {
      id: `HIST-${room.id}-${index + 1}-${Date.now().toString(36)}`,
      roomId: room.id,
      roomTitle: room.title || `Phiên gom đơn của ${room.hostName}`,
      hostName: room.hostName,
      userName: memberName,
      clientIp: clientIp,
      isHost: isHost,
      dishes: (mb.items || []).map(it => ({
        dishName: it.dishName,
        price: it.price,
        restaurantName: it.restaurantName || 'Quán tự chọn',
        note: it.note || ''
      })),
      dishCount: (mb.items || []).length,
      subtotal: mb.subtotal || 0,
      discountShare: mb.discountShare || 0,
      shippingShare: mb.shippingShare || 0,
      finalAmount: mb.finalAmount || 0,
      paymentStatus: 'PAID',
      completedAt: completedAt,
      roomGrandTotal: room.billSummary.grandTotal || 0,
      roomMembersCount: (room.members || []).length
    };

    newRecords.push(record);
    existingHistory.unshift(record); // newest first
  });

  writeAllHistory(existingHistory);

  console.log(`[Order History Saved] Saved ${newRecords.length} records for Room ${room.id} mapped to Client IPs.`);
  return newRecords;
}

/**
 * Query history matching a specific Client IP
 */
export function getHistoryForIp(rawIp) {
  const targetIp = cleanIp(rawIp);
  const all = loadAllHistory();

  // If ip is 127.0.0.1, also include localhost records
  return all.filter(h => {
    const recordIp = cleanIp(h.clientIp);
    if (targetIp === '127.0.0.1') {
      return recordIp === '127.0.0.1' || recordIp === 'localhost';
    }
    return recordIp === targetIp;
  });
}
