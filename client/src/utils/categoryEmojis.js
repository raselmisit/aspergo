// Comprehensive Category & Subcategory Smart Emoji Engine for ASPER GO

const CATEGORY_KEYWORD_MAP = [
  // Motors & Vehicles
  { keywords: ['motor', 'bike', 'motorcycle', 'vehicle', 'car', 'scooter', 'ride', 'auto', 'বাইক', 'মোটর'], emoji: '🏍️' },
  
  // Electronics & Gadgets
  { keywords: ['electronic', 'gadget', 'smart', 'phone', 'mobile', 'earbud', 'headphone', 'watch', 'charger', 'audio', 'speaker', 'laptop', 'computer', 'tech', 'ইলেকট্রনিক্স', 'স্মার্টফোন', 'গ্যাজেট'], emoji: '📱' },
  
  // Fashion & Lifestyle
  { keywords: ['fashion', 'lifestyle', 'cloth', 'apparel', 't-shirt', 'shirt', 'dress', 'wear', 'saree', 'pant', 'leather', 'bag', 'wallet', 'shoe', 'ফ্যাশন', 'পোশাক'], emoji: '👗' },
  
  // Home & Kitchen
  { keywords: ['home', 'kitchen', 'appliance', 'cook', 'blender', 'pan', 'decor', 'furniture', 'lighting', 'bed', 'বাড়ি', 'কিচেন', 'রান্নাঘর'], emoji: '🍳' },
  
  // Groceries & Daily Express
  { keywords: ['grocer', 'daily', 'express', 'food', 'snack', 'tea', 'coffee', 'honey', 'nut', 'rice', 'oil', 'organic', 'fruit', 'মুদি', 'খাবার'], emoji: '🛒' },
  
  // Beauty & Personal Care
  { keywords: ['beauty', 'personal', 'care', 'cosmetic', 'makeup', 'skin', 'skincare', 'perfume', 'grooming', 'hair', 'সৌন্দর্য'], emoji: '💄' },
  
  // Baby & Kids
  { keywords: ['baby', 'kid', 'child', 'toy', 'diaper', 'বাচ্চা', 'খেলনা'], emoji: '🧸' },
  
  // Sports & Fitness
  { keywords: ['sport', 'fitness', 'gym', 'workout', 'cricket', 'football', 'খেলাধুলা'], emoji: '⚽' },
  
  // Health & Medicine
  { keywords: ['health', 'medicine', 'medical', 'pharma', 'ঔষধ', 'স্বাস্থ্য'], emoji: '💊' },
  
  // Tools & Hardware
  { keywords: ['tool', 'hardware', 'diy', 'repair', 'যন্ত্রপাতি'], emoji: '🔧' },
  
  // Jewelry & Luxury
  { keywords: ['jewel', 'gold', 'diamond', 'necklace', 'ring', 'গহনা'], emoji: '💎' },
  
  // Books & Stationery
  { keywords: ['book', 'stationery', 'pen', 'paper', 'বই', 'খাতা'], emoji: '📚' },
  
  // Mega Flash Deals
  { keywords: ['flash', 'deal', 'sale', 'offer', 'mega', 'অফার', 'সেল'], emoji: '🔥' },
  
  // All Products
  { keywords: ['all', 'product', 'catalog', 'সব'], emoji: '🛍️' }
];

const SUBCATEGORY_KEYWORD_MAP = [
  // Motors Accessories
  { keywords: ['helmat', 'helmet', 'হেলমেট'], emoji: '🪖' },
  { keywords: ['raincote', 'raincoat', 'রেইনকোট', 'বৃষ্টি'], emoji: '🌧️' },
  { keywords: ['dustcote', 'dustcoat', 'ডাস্টকোট', 'কভার'], emoji: '🧥' },
  { keywords: ['engin', 'engine', 'oil', 'lubricant', 'ইঞ্জিন', 'অয়েল'], emoji: '🛢️' },
  { keywords: ['lock', 'security', 'brake', 'লক'], emoji: '🔒' },
  
  // Electronics
  { keywords: ['earbud', 'headphone', 'airpod', 'tws', 'audio', 'ইয়ারবাড'], emoji: '🎧' },
  { keywords: ['smartwatch', 'watch', 'band', 'স্মার্টওয়াচ', 'ঘড়ি'], emoji: '⌚' },
  { keywords: ['power bank', 'charger', 'adapter', 'cable', 'battery', 'চার্জার', 'পাওয়ার ব্যাংক'], emoji: '🔋' },
  { keywords: ['speaker', 'sound', 'bass', 'স্পিকার'], emoji: '🔊' },
  { keywords: ['camera', 'lens', 'ক্যামেরা'], emoji: '📷' },
  
  // Fashion
  { keywords: ['t-shirt', 'polo', 'shirt', 'টি-শার্ট', 'শার্ট'], emoji: '👕' },
  { keywords: ['women', 'saree', 'kurti', 'ethnic', 'শাড়ি', 'কুর্তি'], emoji: '👗' },
  { keywords: ['bag', 'wallet', 'purse', 'leather', 'ব্যাগ', 'ওয়ালেট'], emoji: '👜' },
  { keywords: ['shoe', 'sneaker', 'sandal', 'জুতা'], emoji: '👟' },
  { keywords: ['eyewear', 'sunglass', 'glasses', 'সানগ্লাস'], emoji: '🕶️' },
  
  // Home & Kitchen
  { keywords: ['appliance', 'blender', 'air fryer', 'cooker', 'ব্লেন্ডার', 'কুকার'], emoji: '🍳' },
  { keywords: ['decor', 'light', 'led', 'lamp', 'লাইট', 'বাতি'], emoji: '💡' },
  { keywords: ['clean', 'mop', 'organizer', 'storage', 'ক্লিন'], emoji: '🧹' },
  
  // Groceries
  { keywords: ['tea', 'coffee', 'honey', 'চা', 'কফি', 'মধু'], emoji: '☕' },
  { keywords: ['nut', 'dry fruit', 'almond', 'dates', 'বাদাম', 'খেজুর'], emoji: '🥜' },
  { keywords: ['spice', 'masala', 'মসলা'], emoji: '🧂' },
  { keywords: ['rice', 'চাল'], emoji: '🍚' },
  
  // Care
  { keywords: ['skin', 'face', 'serum', 'cream', 'skincare', 'ত্বক'], emoji: '🧴' },
  { keywords: ['grooming', 'shav', 'trimmer', 'শেভিং', 'ট্রিমার'], emoji: '🪒' },
  { keywords: ['perfume', 'attar', 'scent', 'পারফিউম', 'আতর'], emoji: '✨' }
];

// Helper to check if string contains an actual emoji
export function isEmoji(str) {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  // Regex to match unicode emojis
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u;
  return emojiRegex.test(trimmed);
}

// Extract first emoji if present
export function extractEmoji(str) {
  if (!str || typeof str !== 'string') return null;
  const match = str.match(/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u);
  return match ? match[0] : null;
}

// Get Best Category Emoji
export function getCategoryEmoji(categoryOrName, explicitIcon = null) {
  let name = '';
  let icon = explicitIcon;

  if (typeof categoryOrName === 'string') {
    name = categoryOrName;
  } else if (categoryOrName && typeof categoryOrName === 'object') {
    name = categoryOrName.name || categoryOrName.title || '';
    if (!icon) icon = categoryOrName.icon;
  }

  // 1. If explicit icon is an emoji, return it
  if (icon && isEmoji(icon)) {
    return icon.trim();
  }

  // 2. If name itself starts with or contains an emoji
  const foundInName = extractEmoji(name);
  if (foundInName) return foundInName;

  // 3. Keyword matching
  const normalized = (name || '').toLowerCase();
  for (const item of CATEGORY_KEYWORD_MAP) {
    if (item.keywords.some(kw => normalized.includes(kw))) {
      return item.emoji;
    }
  }

  // 4. Default fallback
  return '🏷️';
}

// Get Best Subcategory Emoji
export function getSubcategoryEmoji(subOrName, parentName = '', explicitIcon = null) {
  let name = '';
  let icon = explicitIcon;

  if (typeof subOrName === 'string') {
    name = subOrName;
  } else if (subOrName && typeof subOrName === 'object') {
    name = subOrName.name || '';
    if (!icon) icon = subOrName.icon;
  }

  // 1. If explicit icon is an emoji, return it
  if (icon && isEmoji(icon)) {
    return icon.trim();
  }

  // 2. If name has an emoji
  const foundInName = extractEmoji(name);
  if (foundInName) return foundInName;

  // 3. Subcategory keyword matching
  const normalized = (name || '').toLowerCase();
  for (const item of SUBCATEGORY_KEYWORD_MAP) {
    if (item.keywords.some(kw => normalized.includes(kw))) {
      return item.emoji;
    }
  }

  // 4. Fallback to parent category emoji if available
  if (parentName) {
    return getCategoryEmoji(parentName);
  }

  return '🔹';
}

// Popular Preset Emojis for quick picking in Admin
export const PRESET_EMOJIS = [
  '🏍️', '📱', '👗', '🍳', '🛒', '💄', '🔥', '🛍️', 
  '🪖', '🌧️', '🧥', '🛢️', '🔒', '🎧', '⌚', '🔋', 
  '🔊', '👕', '👜', '👟', '💡', '🧹', '☕', '🥜', 
  '🧴', '🪒', '🧸', '⚽', '📚', '💎', '💊', '🔧',
  '✨', '⚡', '🎁', '🍎', '🏷️', '📦', '🌟', '🚀'
];
