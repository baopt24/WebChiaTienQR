// Helper to generate VietQR image URL & EMVCo description
export function generateVietQRUrl({ bankId, accountNo, accountName, amount, memo }) {
  // Use official VietQR quick image API (Napas247 standard)
  const cleanBank = encodeURIComponent(bankId || 'MB');
  const cleanAcc = encodeURIComponent(accountNo || '0987654321');
  const cleanAmount = Math.max(0, Math.round(amount || 0));
  const cleanMemo = encodeURIComponent(memo || 'GOM DON VKU');
  const cleanName = encodeURIComponent(accountName || 'CHU PHONG');

  return `https://img.vietqr.io/image/${cleanBank}-${cleanAcc}-compact2.png?amount=${cleanAmount}&addInfo=${cleanMemo}&accountName=${cleanName}`;
}

// Fair split algorithm:
// Distribute discount proportionally to food value, and split shipping fee equally
export function calculateSplitBill({ items, members, discountAmount = 0, shippingFee = 0, hostAccount = {} }) {
  const userMap = {};

  // Group items by user
  items.forEach(item => {
    if (!userMap[item.userName]) {
      userMap[item.userName] = {
        userName: item.userName,
        userSocketId: item.userSocketId,
        items: [],
        subtotal: 0,
        discount: 0,
        shipping: 0,
        finalAmount: 0,
        vietQRUrl: ''
      };
    }
    userMap[item.userName].items.push(item);
    userMap[item.userName].subtotal += item.price;
  });

  const activeUsers = Object.values(userMap);
  const totalSubtotal = activeUsers.reduce((sum, u) => sum + u.subtotal, 0);
  const numUsers = activeUsers.length || 1;

  if (totalSubtotal === 0) {
    return {
      totalSubtotal: 0,
      discountAmount,
      shippingFee,
      grandTotal: shippingFee,
      userBills: []
    };
  }

  const shippingPerPerson = Math.round(shippingFee / numUsers);

  let distributedDiscount = 0;
  activeUsers.forEach((u, idx) => {
    // Proportional discount
    let userDiscount = 0;
    if (idx === activeUsers.length - 1) {
      // Last person absorbs rounding delta
      userDiscount = Math.max(0, discountAmount - distributedDiscount);
    } else {
      userDiscount = Math.round((u.subtotal / totalSubtotal) * discountAmount);
      distributedDiscount += userDiscount;
    }

    u.discount = userDiscount;
    u.shipping = shippingPerPerson;
    u.finalAmount = Math.max(0, u.subtotal - userDiscount + shippingPerPerson);

    // Generate VietQR for this specific user
    u.vietQRUrl = generateVietQRUrl({
      bankId: hostAccount.bankId || 'MB',
      accountNo: hostAccount.accountNo || '0987654321',
      accountName: hostAccount.accountName || 'CHU PHONG',
      amount: u.finalAmount,
      memo: `GOM DON ${u.userName}`.substring(0, 25)
    });
  });

  const grandTotal = activeUsers.reduce((sum, u) => sum + u.finalAmount, 0);

  return {
    totalSubtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    userBills: activeUsers
  };
}
