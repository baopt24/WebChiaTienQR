import { io } from 'socket.io-client';

// Dynamically connect to backend Server using the current Network Host/IP
export const SERVER_URL = `${window.location.protocol}//${window.location.hostname}:4000`;

export const socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling']
});

/**
 * Socket.io Event Contracts Documentation
 * 
 * Client -> Server:
 * - create_room: ({ hostName, restaurantName, menu, hostAccount }, callback)
 * - join_room: ({ roomId, userName }, callback)
 * - add_item: ({ roomId, item: { dishName, price, note, userName } })
 * - remove_item: ({ roomId, itemId })
 * - add_custom_dish: ({ roomId, dish: { name, price, category, desc } })
 * - lock_order: ({ roomId, shippingFee, discountAmount, hostAccount })
 * - unlock_order: ({ roomId })
 * 
 * Server -> Client:
 * - room_state: (roomObject)
 * - member_joined: ({ userName, members })
 * - cart_updated: ({ items })
 * - order_locked: ({ billSummary })
 * - order_unlocked: ()
 */
