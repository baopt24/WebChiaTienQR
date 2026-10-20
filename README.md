# WebChiaTienQR - Real-time Group Ordering & Automated Bill-Splitting System

[![Client-Server](https://img.shields.io/badge/Architecture-Client--Server-orange.svg)]()
[![WebSockets](https://img.shields.io/badge/Protocol-WebSockets%20(Socket.io)-green.svg)]()
[![Payment](https://img.shields.io/badge/Payment-VietQR%20(EMVCo)-blue.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]()

> A full-featured Real-time Group Ordering and Bill-Splitting Web Application based on a two-way Client-Server architecture (Node.js/Express + Socket.io + React + Tailwind CSS).

---

## 🏗️ 1. Architecture & Technology Stack

- **Server Backend:** Node.js, Express, Socket.io, CORS, Dotenv.
- **Client Frontend:** React 18, Vite, Tailwind CSS, Socket.io-client, Lucide-react, QRCode.react.
- **Network Protocol:** Two-way real-time communication via WebSockets (`socket.io`). Zero page reloads required for state synchronization.
- **Payment Standard:** Automated Dynamic VietQR generation conforming to Napas247 / EMVCo standards.

```
[Member A (Client / Mobile)]     [Member B (Client / Mobile)]     [Host (Client / Web)]
           │                                 │                              │
           └─────────────────┬───────────────┴──────────────────────────────┘
                             │ WebSocket (Full-duplex Event Stream)
                             ▼
              ┌──────────────────────────────────────────────┐
              │          NODE.JS & SOCKET.IO SERVER          │
              │  - server/index.js (REST & WS Engine)        │
              │  - server/src/socket.js (Room Management)    │
              │  - server/src/billSplit.js (Fair Split)      │
              │  - server/src/vietqr.js (VietQR Generator)   │
              └──────────────────────────────────────────────┘
```

---

## 📁 2. Modular Codebase Structure

```
WebChiaTienQR/
├── server/
│   ├── index.js                  # Main server entry point (Express, Socket.io, HTTP)
│   ├── package.json              # Server dependencies & scripts
│   └── src/
│       ├── socket.js             # Real-time WebSocket event controllers & room store
│       ├── billSplit.js          # Phase 4: Automated Fair Bill-Splitting logic
│       ├── vietqr.js             # Phase 5: Dynamic VietQR URL & parameter generator
│       └── data/
│           └── presets.js        # Categorized food & beverage menus & bank list
├── client/
│   ├── index.html                # Single-page application entry HTML
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind CSS theme & extensions
│   └── src/
│       ├── main.jsx              # React DOM bootstrap
│       ├── App.jsx               # Root UI controller & socket orchestrator
│       ├── index.css             # Tailwind base & utilities
│       ├── services/
│       │   └── socket.js         # Singleton socket client & event contract docs
│       ├── utils/
│       │   └── formatters.js     # Currency (VND) & date formatters
│       └── components/
│           ├── JoinCreateModal.jsx       # Phase 1: Host Room Creation & Member Join
│           ├── RoomHeader.jsx            # Live header, status, online counter
│           ├── MenuSection.jsx           # Phase 2: Categorized menu, search & selection
│           ├── SharedCart.jsx            # Phase 2: Live cart grouped by member
│           ├── LockOrderModal.jsx        # Phase 3: Host locking & fee inputs
│           ├── BillSummarySection.jsx    # Phase 4 & 5: Fair split & dynamic VietQR
│           ├── QRShareModal.jsx          # Live QR code for room link
│           └── AddCustomDishModal.jsx    # Custom item addition modal
├── start-all.bat                 # 1-Click launcher for both backend & frontend
└── README.md                     # Technical documentation & event contracts
```

---

## 📡 3. Socket.io Event Contracts

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `create_room` | Client $\rightarrow$ Server | `{ hostName, restaurantName, menu, hostAccount }` | Host initializes a new room; server creates Room State and returns `roomId`. |
| `join_room` | Client $\rightarrow$ Server | `{ roomId, userName }` | Member joins room; server attaches socket to room and broadcasts update. |
| `member_joined` | Server $\rightarrow$ Client | `{ userName, members }` | Broadcast to all room members when someone enters. |
| `add_item` | Client $\rightarrow$ Server | `{ roomId, item: { dishName, price, note, userName } }` | Member adds item to shared cart. |
| `remove_item` | Client $\rightarrow$ Server | `{ roomId, itemId }` | Member/Host removes an item from shared cart. |
| `cart_updated` | Server $\rightarrow$ Client | `{ items }` | Broadcast whenever items are added or removed. |
| `add_custom_dish` | Client $\rightarrow$ Server | `{ roomId, dish: { name, price, category, desc } }` | Adds a custom item to the room's live menu. |
| `lock_order` | Client $\rightarrow$ Server | `{ roomId, shippingFee, discountAmount, hostAccount }` | Host locks room; triggers fair split calculation and VietQR generation. |
| `order_locked` | Server $\rightarrow$ Client | `{ billSummary }` | Broadcast to all members with finalized individual bills & VietQR URLs. |
| `unlock_order` | Client $\rightarrow$ Server | `{ roomId }` | Host unlocks room to allow further changes. |
| `order_unlocked` | Server $\rightarrow$ Client | `void` | Broadcast when room is re-opened. |
| `room_state` | Server $\rightarrow$ Client | `roomObject` | Full authoritative room state sync. |

---

## 🧮 4. Automated Fair Bill-Splitting Formula

Once the Host locks the order and inputs the real fees from the delivery app (ShopeeFood / GrabFood):
1. **Shipping Share:**
   $$\text{Ship}_i = \text{round}\left(\frac{\text{shippingFee}}{N}\right)$$
   *(Divided equally among $N$ ordering members)*.
2. **Proportional Discount Share:**
   $$\text{Discount}_i = \text{round}\left(\text{discountAmount} \times \frac{\text{Subtotal}_i}{\text{TotalSubtotal}}\right)$$
   *(Distributed proportionally to their ordered food value; last member absorbs rounding delta)*.
3. **Final Amount:**
   $$\text{FinalAmount}_i = \max\left(0, \text{Subtotal}_i + \text{Ship}_i - \text{Discount}_i\right)$$

---

## 💳 5. Dynamic VietQR Specification

The personalized VietQR code is generated dynamically without third-party backend SDKs using the direct Napas247 image endpoint:
```
https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-compact.png?amount=<FINAL_AMOUNT>&addInfo=<ROOM_ID>%20<MEMBER_NAME>
```
* **`<BANK_ID>`:** e.g., `MB`, `VCB`, `TCB`, `BIDV`.
* **`<ACCOUNT_NO>`:** Host's bank account number.
* **`<FINAL_AMOUNT>`:** Exact calculated $\text{FinalAmount}_i$.
* **`<addInfo>`:** Pre-fills transfer description: `ROOM-8888 THAI BAO` for automated reconciliation.

---

## 🚀 6. Quick Start

### 1-Click Launch (Windows)
Double-click:
👉 **`start-all.bat`**

### Manual Commands
1. **Start Backend Server (Port 4000):**
   ```bash
   cd server
   npm run dev
   ```
2. **Start Frontend Client (Port 3000):**
   ```bash
   cd client
   npm run dev
   ```
3. Open `http://localhost:3000` in browser.
