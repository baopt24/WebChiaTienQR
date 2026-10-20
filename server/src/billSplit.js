import { generateVietQRUrl } from './vietqr.js';

/**
 * Phase 4: Automated Fair Bill-Splitting Algorithm
 * 
 * Formulas:
 * 1. Ship_i = shippingFee / N (divided equally among N members with items)
 * 2. Discount_i = discountAmount * (Subtotal_i / TotalSubtotal)
 * 3. FinalAmount_i = Math.round(Subtotal_i + Ship_i - Discount_i)
 */
export function calculateFairSplitBill({
  roomId,
  items = [],
  members = [],
  shippingFee = 0,
  discountAmount = 0,
  hostAccount = {}
}) {
  const userMap = {};

  // Group items by member name
  items.forEach(item => {
    const memberName = item.userName || 'Ẩn danh';
    if (!userMap[memberName]) {
      userMap[memberName] = {
        userName: memberName,
        userSocketId: item.userSocketId,
        items: [],
        subtotal: 0,
        shippingShare: 0,
        discountShare: 0,
        finalAmount: 0,
        vietQRUrl: ''
      };
    }
    userMap[memberName].items.push(item);
    userMap[memberName].subtotal += Number(item.price) || 0;
  });

  const memberBills = Object.values(userMap);
  const totalSubtotal = memberBills.reduce((sum, m) => sum + m.subtotal, 0);
  const N = memberBills.length;

  const numShipping = Math.max(0, Number(shippingFee) || 0);
  const numDiscount = Math.max(0, Number(discountAmount) || 0);

  if (N === 0 || totalSubtotal === 0) {
    return {
      totalSubtotal: 0,
      shippingFee: numShipping,
      discountAmount: numDiscount,
      grandTotal: numShipping,
      memberBills: []
    };
  }

  // 1. Ship_i = shippingFee / N (divided equally among N ordering members)
  const equalShip = Math.round(numShipping / N);

  let accumulatedDiscount = 0;

  memberBills.forEach((m, index) => {
    // 2. Discount_i = discountAmount * (Subtotal_i / TotalSubtotal)
    let discountI = 0;
    if (index === N - 1) {
      // Last member absorbs slight rounding delta so sum of discounts matches exactly
      discountI = Math.max(0, numDiscount - accumulatedDiscount);
    } else {
      discountI = Math.round(numDiscount * (m.subtotal / totalSubtotal));
      accumulatedDiscount += discountI;
    }

    // 3. FinalAmount_i = Subtotal_i + Ship_i - Discount_i
    const finalAmountI = Math.max(0, Math.round(m.subtotal + equalShip - discountI));

    m.shippingShare = equalShip;
    m.discountShare = discountI;
    m.finalAmount = finalAmountI;

    // Phase 5: Dynamic VietQR Generation
    m.vietQRUrl = generateVietQRUrl({
      bankId: hostAccount.bankId || 'MB',
      accountNo: hostAccount.accountNo || '0987654321',
      amount: m.finalAmount,
      roomId: roomId,
      memberName: m.userName
    });
  });

  const grandTotal = memberBills.reduce((sum, m) => sum + m.finalAmount, 0);

  return {
    totalSubtotal,
    shippingFee: numShipping,
    discountAmount: numDiscount,
    grandTotal,
    memberBills
  };
}
