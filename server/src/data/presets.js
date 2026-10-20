// Preset Restaurants & Menus with Real Images & Metadata
export let PRESET_RESTAURANTS = [
  {
    id: 'rest-mixue',
    name: 'Trà Sữa Mixue (Làng ĐH - VKU)',
    category: 'Trà sữa & Kem',
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&q=80',
    address: 'Khu Đô thị ĐH Đà Nẵng, Nam Kỳ Khởi Nghĩa',
    items: [
      { 
        id: 'mx-1', 
        name: 'Trà sữa Trân châu đường đen', 
        price: 25000, 
        category: 'Trà sữa', 
        desc: 'Đậm vị hồng trà, trân châu dai giòn nấu đường đen thơm phức',
        image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=350&q=80'
      },
      { 
        id: 'mx-2', 
        name: 'Trà Đào bốn mùa', 
        price: 22000, 
        category: 'Trà hoa quả', 
        desc: 'Thơm đào tươi, ngọt thanh giải nhiệt ngày nắng nóng',
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=350&q=80'
      },
      { 
        id: 'mx-3', 
        name: 'Kem ốc quế Lắc dâu', 
        price: 12000, 
        category: 'Kem', 
        desc: 'Kem vani giòn tan phủ xốt dâu tây ngọt mát',
        image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=350&q=80'
      },
      { 
        id: 'mx-4', 
        name: 'Trà Chanh tươi lạnh', 
        price: 15000, 
        category: 'Trà hoa quả', 
        desc: 'Vị chua ngọt sảng khoái với chanh tươi thái lát',
        image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=350&q=80'
      },
      { 
        id: 'mx-5', 
        name: 'Dương chi cam lộ', 
        price: 25000, 
        category: 'Trà hoa quả', 
        desc: 'Xoài tươi xay cùng thạch dừa giòn sần sật',
        image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=350&q=80'
      }
    ]
  },
  {
    id: 'rest-phuclong',
    name: 'Phúc Long Coffee & Tea',
    category: 'Trà & Cà phê cao cấp',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80',
    address: 'Lê Duẩn / Nguyễn Văn Linh, Đà Nẵng',
    items: [
      { 
        id: 'pl-1', 
        name: 'Trà Ô long sữa Phúc Long', 
        price: 45000, 
        category: 'Trà sữa', 
        desc: 'Hương vị trà Ô long nướng đậm đà truyền thống trứ danh',
        image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=350&q=80'
      },
      { 
        id: 'pl-2', 
        name: 'Trà Đào Cam Sả', 
        price: 50000, 
        category: 'Trà trái cây', 
        desc: 'Miếng đào giòn kết hợp nước cốt cam vàng và sả tươi',
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=350&q=80'
      },
      { 
        id: 'pl-3', 
        name: 'Trà sữa Lài (Jasmine Milk Tea)', 
        price: 45000, 
        category: 'Trà sữa', 
        desc: 'Hương hoa lài thoang thoảng kết hợp sữa béo ngọt dịu',
        image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=350&q=80'
      },
      { 
        id: 'pl-4', 
        name: 'Cà phê Phin sữa đá', 
        price: 38000, 
        category: 'Cà phê', 
        desc: 'Đậm chất Việt Nam, cà phê rang xay nguyên chất thơm ngậy',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=350&q=80'
      }
    ]
  },
  {
    id: 'rest-comtam247',
    name: 'Cơm Tấm & Cơm Gà Xối Mỡ 247',
    category: 'Cơm trưa sinh viên',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80',
    address: 'Đường Trần Đại Nghĩa, gần ký túc xá VKU',
    items: [
      { 
        id: 'ct-1', 
        name: 'Cơm tấm sườn bì chả đặc biệt', 
        price: 35000, 
        category: 'Cơm tấm', 
        desc: 'Sườn nướng than hoa mật ong mềm ngọt, chả trứng béo ngậy',
        image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=350&q=80'
      },
      { 
        id: 'ct-2', 
        name: 'Cơm gà xối mỡ giòn rụm', 
        price: 35000, 
        category: 'Cơm gà', 
        desc: 'Góc tư đùi gà xối mỡ giòn tan, ăn kèm cơm chiên tỏi và dưa góp',
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=350&q=80'
      },
      { 
        id: 'ct-3', 
        name: 'Cơm sườn nướng ốp la', 
        price: 30000, 
        category: 'Cơm tấm', 
        desc: 'Sườn nướng thơm kèm trứng gà ốp la lòng đào sốt mỡ hành',
        image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=350&q=80'
      },
      { 
        id: 'ct-4', 
        name: 'Canh rong biển thịt bằm', 
        price: 10000, 
        category: 'Món thêm', 
        desc: 'Thanh mát giải nhiệt, nấu cùng thịt nạc băm viên',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=350&q=80'
      }
    ]
  }
];

export const POPULAR_BANKS = [
  { code: 'MB', name: 'MBBank (Quân Đội)' },
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'ICB', name: 'VietinBank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'TPB', name: 'TPBank' }
];

// Helper functions for Admin Mutations
export function addRestaurant({ name, category, image, address }) {
  const newRest = {
    id: `rest-${Date.now()}`,
    name: name.trim(),
    category: category.trim() || 'Quán ăn',
    image: image?.trim() || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80',
    address: address?.trim() || 'Khu vực Làng Đại học',
    items: []
  };
  PRESET_RESTAURANTS.push(newRest);
  return newRest;
}

export function updateRestaurant(id, { name, category, image, address }) {
  const rest = PRESET_RESTAURANTS.find(r => r.id === id);
  if (!rest) return null;
  if (name) rest.name = name.trim();
  if (category) rest.category = category.trim();
  if (image) rest.image = image.trim();
  if (address) rest.address = address.trim();
  return rest;
}

export function deleteRestaurant(id) {
  const index = PRESET_RESTAURANTS.findIndex(r => r.id === id);
  if (index === -1) return false;
  PRESET_RESTAURANTS.splice(index, 1);
  return true;
}

export function addDishToRestaurant(restId, { name, price, image, category, desc }) {
  const rest = PRESET_RESTAURANTS.find(r => r.id === restId);
  if (!rest) return null;
  const newDish = {
    id: `dish-${Date.now()}`,
    name: name.trim(),
    price: Math.max(0, parseInt(price) || 0),
    category: category?.trim() || 'Món chính',
    desc: desc?.trim() || '',
    image: image?.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=350&q=80'
  };
  rest.items.push(newDish);
  return newDish;
}

export function updateDish(restId, dishId, { name, price, image, category, desc }) {
  const rest = PRESET_RESTAURANTS.find(r => r.id === restId);
  if (!rest) return null;
  const dish = rest.items.find(d => d.id === dishId);
  if (!dish) return null;
  if (name) dish.name = name.trim();
  if (price !== undefined) dish.price = Math.max(0, parseInt(price) || 0);
  if (image) dish.image = image.trim();
  if (category) dish.category = category.trim();
  if (desc !== undefined) dish.desc = desc.trim();
  return dish;
}

export function deleteDish(restId, dishId) {
  const rest = PRESET_RESTAURANTS.find(r => r.id === restId);
  if (!rest) return false;
  const index = rest.items.findIndex(d => d.id === dishId);
  if (index === -1) return false;
  rest.items.splice(index, 1);
  return true;
}
