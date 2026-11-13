import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Persistent file path inside server/data/
const DATA_DIR = path.resolve(__dirname, '../../data');
const HISTORY_FILE = path.join(DATA_DIR, 'order_history.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ==================================================================
// AES-256-GCM ENCRYPTION & INTEGRITY VERIFICATION
// ==================================================================
// Secret key derived using scrypt for cryptographic strength
const ENCRYPTION_SECRET = process.env.HISTORY_ENCRYPTION_SECRET || 'vku-24it023-pham-thai-bao-do-an-co-so-4-aes256';
const ENCRYPTION_SALT = 'vku-khmt-splitbill-2026';
const ENCRYPTION_KEY = crypto.scryptSync(ENCRYPTION_SECRET, ENCRYPTION_SALT, 32);
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt arbitrary JavaScript object/array to AES-256-GCM envelope
 */
function encryptEnvelope(data) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const jsonStr = JSON.stringify(data);
  let cipherText = cipher.update(jsonStr, 'utf8', 'hex');
  cipherText += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    security: 'AES-256-GCM',
    algorithm: ALGORITHM,
    version: '1.0',
    encryptedAt: new Date().toISOString(),
    iv: iv.toString('hex'),
    authTag: authTag,
    cipherText: cipherText
  };
}

/**
 * Decrypt AES-256-GCM envelope into JavaScript object/array
 */
function decryptEnvelope(rawContent) {
  if (!rawContent || !rawContent.trim()) return [];
  try {
    const parsed = JSON.parse(rawContent);

    // If file is encrypted envelope
    if (parsed && parsed.security === 'AES-256-GCM' && parsed.cipherText && parsed.iv && parsed.authTag) {
      const iv = Buffer.from(parsed.iv, 'hex');
      const authTag = Buffer.from(parsed.authTag, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(parsed.cipherText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted || '[]');
    }

    // Backward compatibility if file was previously plain JSON array
    if (Array.isArray(parsed)) {
      return parsed;
    }

    return [];
  } catch (err) {
    console.error('[Crypto Error] Failed to decrypt order history database:', err.message);
    return [];
  }
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

// Read and decrypt all history records in memory
export function loadAllHistory() {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      const emptyEncrypted = encryptEnvelope([]);
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(emptyEncrypted, null, 2), 'utf-8');
      return [];
    }
    const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return decryptEnvelope(data);
  } catch (err) {
    console.error('Error reading order history:', err);
    return [];
  }
}

// Encrypt and write all history records to disk
function writeAllHistory(list) {
  try {
    const encryptedPayload = encryptEnvelope(list);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(encryptedPayload, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing order history:', err);
  }
}

/**
 * When the last member pays (100% completed), record history for every participant based on their device IP.
 * Crucially: Records all participant IPs so ONLY members who were in the room can access this history!
 */
export function saveCompletedRoomHistory(room) {
  if (!room || !room.billSummary || !room.billSummary.memberBills) return [];

  const existingHistory = loadAllHistory();
  const completedAt = new Date().toISOString();
  const newRecords = [];

  // Map member names to their client IPs recorded during socket join
  const memberIpMap = {};
  const allParticipantIps = new Set();

  if (room.hostIp) {
    const cleanHostIp = cleanIp(room.hostIp);
    allParticipantIps.add(cleanHostIp);
    if (room.hostName) {
      memberIpMap[room.hostName.toLowerCase()] = cleanHostIp;
    }
  }

  (room.members || []).forEach(m => {
    if (m.name) {
      const ip = cleanIp(m.clientIp);
      memberIpMap[m.name.toLowerCase()] = ip;
      allParticipantIps.add(ip);
    }
  });

  // Also check items' client IPs if available
  (room.items || []).forEach(it => {
    if (it.userName) {
      const ip = cleanIp(it.clientIp);
      if (!memberIpMap[it.userName.toLowerCase()] && ip) {
        memberIpMap[it.userName.toLowerCase()] = ip;
      }
      if (ip) allParticipantIps.add(ip);
    }
  });

  const hostIp = cleanIp(room.hostIp || memberIpMap[room.hostName?.toLowerCase()]);
  const participantIpsList = Array.from(allParticipantIps);

  room.billSummary.memberBills.forEach((mb, index) => {
    const memberName = mb.userName || 'Thành viên';
    const clientIp = memberIpMap[memberName.toLowerCase()] || hostIp || '127.0.0.1';
    const isHost = memberName.toLowerCase() === (room.hostName || '').toLowerCase();

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
      clientIp: clientIp, // The IP of this specific member
      participantIps: participantIpsList, // All authorized participant IPs of this room
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

  console.log(`[Order History Saved] Saved ${newRecords.length} records for Room ${room.id} encrypted with AES-256-GCM. Authorized IPs: ${participantIpsList.join(', ')}`);
  return newRecords;
}

/**
 * Query history strictly matching a specific Client IP:
 * - ONLY returns records if this clientIp was an authorized participant in that room!
 * - An outsider (not in participantIps) receives an empty list [].
 */
export function getHistoryForIp(rawIp) {
  const targetIp = cleanIp(rawIp);
  const all = loadAllHistory();

  return all.filter(record => {
    const memberIp = cleanIp(record.clientIp);
    const participantIps = (record.participantIps || []).map(cleanIp);

    // If client is 127.0.0.1 (local dev test)
    if (targetIp === '127.0.0.1') {
      return (
        memberIp === '127.0.0.1' ||
        memberIp === 'localhost' ||
        participantIps.includes('127.0.0.1') ||
        participantIps.includes('localhost')
      );
    }

    // Only return if this member's own record matches their IP,
    // or if they were one of the room's verified participants
    return memberIp === targetIp;
  });
}
