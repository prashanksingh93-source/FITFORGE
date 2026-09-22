export const products = [
  // PERFORMANCE
  {
    id: 'p1', name: 'Icon Performance Tee', description: 'Ultra-breathable training tee.',
    price: 1499, salePrice: null, category: 'T-Shirts', gender: 'Men', collection: 'Performance',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White', 'Grey'], stock: 50,
    material: '85% Polyester, 15% Elastane', fit: 'Athletic Fit', careInstructions: 'Machine wash cold.',
    isIconic: true, isBestSeller: true, isNewArrival: false, isLimitedEdition: false
  },
  {
    id: 'p2', name: 'Elite Training Joggers', description: 'Four-way stretch for maximum mobility.',
    price: 2499, salePrice: 1999, category: 'Joggers', gender: 'Men', collection: 'Performance',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
    sizes: ['M', 'L', 'XL'], colors: ['Black', 'Navy'], stock: 30,
    material: '90% Nylon, 10% Spandex', fit: 'Tapered', careInstructions: 'Wash inside out.',
    isIconic: true, isBestSeller: false, isNewArrival: true, isLimitedEdition: false
  },
  {
    id: 'p3', name: 'Core Compression Top', description: 'Base layer for intense workouts.',
    price: 1799, salePrice: null, category: 'Compression', gender: 'Men', collection: 'Performance',
    image: 'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?w=800',
    sizes: ['S', 'M', 'L'], colors: ['Black'], stock: 20,
    material: 'Polyester/Spandex Blend', fit: 'Tight', careInstructions: 'Do not tumble dry.',
    isIconic: false, isBestSeller: false, isNewArrival: false, isLimitedEdition: false
  },
  {
    id: 'p4', name: 'Aero Sports Bra', description: 'High-support for high impact.',
    price: 1999, salePrice: null, category: 'Sports Bras', gender: 'Women', collection: 'Performance',
    image: 'https://images.unsplash.com/photo-1608228079968-c7681ea8377e?w=800',
    sizes: ['XS', 'S', 'M'], colors: ['Black', 'White'], stock: 40,
    material: 'Nylon/Elastane', fit: 'Compression', careInstructions: 'Machine wash cold.',
    isIconic: false, isBestSeller: true, isNewArrival: false, isLimitedEdition: false
  },
  {
    id: 'p5', name: 'Flex Training Shorts', description: 'Lightweight and durable.',
    price: 1499, salePrice: null, category: 'Shorts', gender: 'Men', collection: 'Performance',
    image: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800',
    sizes: ['M', 'L', 'XL'], colors: ['Black', 'Charcoal'], stock: 60,
    material: '100% Polyester', fit: 'Standard', careInstructions: 'Machine wash cold.',
    isIconic: false, isBestSeller: false, isNewArrival: true, isLimitedEdition: false
  },
  {
    id: 'p6', name: 'Seamless Flex Leggings', description: 'Squat-proof seamless design.',
    price: 2499, salePrice: null, category: 'Leggings', gender: 'Women', collection: 'Performance',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800',
    sizes: ['S', 'M', 'L'], colors: ['Black', 'Grey'], stock: 25,
    material: 'Seamless Knit', fit: 'Form-fitting', careInstructions: 'Wash cold with like colors.',
    isIconic: true, isBestSeller: true, isNewArrival: false, isLimitedEdition: false
  },

  // LUXURY
  {
    id: 'l1', name: 'Obsidian Premium Hoodie', description: 'Heavyweight French terry cotton.',
    price: 6499, salePrice: null, category: 'Hoodies', gender: 'Unisex', collection: 'Luxury',
    image: 'https://images.unsplash.com/photo-1614031679093-68d7162624fc?w=800',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Obsidian Black'], stock: 15,
    material: '100% Premium Cotton', fit: 'Oversized', careInstructions: 'Dry clean recommended.',
    isIconic: true, isBestSeller: false, isNewArrival: true, isLimitedEdition: true
  },
  {
    id: 'l2', name: 'Onyx Sculpt Leggings', description: 'Buttery soft with subtle metallic branding.',
    price: 4999, salePrice: null, category: 'Leggings', gender: 'Women', collection: 'Luxury',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800',
    sizes: ['XS', 'S', 'M'], colors: ['Onyx'], stock: 20,
    material: 'Premium Microfiber Blend', fit: 'Sculpting', careInstructions: 'Hand wash cold.',
    isIconic: false, isBestSeller: true, isNewArrival: false, isLimitedEdition: false
  },
  {
    id: 'l3', name: 'Carbon Tech Jacket', description: 'Windproof and water-resistant.',
    price: 9999, salePrice: 7999, category: 'Jackets', gender: 'Men', collection: 'Luxury',
    image: 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=800',
    sizes: ['M', 'L'], colors: ['Carbon Black'], stock: 10,
    material: 'Tech-woven Nylon', fit: 'Tailored', careInstructions: 'Wipe with damp cloth.',
    isIconic: true, isBestSeller: false, isNewArrival: false, isLimitedEdition: true
  },
  {
    id: 'l4', name: 'Aura Luxury Crop Top', description: 'Elegant studio-to-street wear.',
    price: 4999, salePrice: null, category: 'T-Shirts', gender: 'Women', collection: 'Luxury',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    sizes: ['S', 'M'], colors: ['Black', 'White'], stock: 30,
    material: 'Modal/Elastane', fit: 'Fitted', careInstructions: 'Machine wash delicate.',
    isIconic: false, isBestSeller: false, isNewArrival: true, isLimitedEdition: false
  },
  {
    id: 'l5', name: 'Monarch Training Joggers', description: 'Refined silhouette with premium hardware.',
    price: 7999, salePrice: null, category: 'Joggers', gender: 'Men', collection: 'Luxury',
    image: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=800',
    sizes: ['M', 'L', 'XL'], colors: ['Charcoal'], stock: 12,
    material: 'Premium Tech Fleece', fit: 'Slim Tapered', careInstructions: 'Dry clean only.',
    isIconic: false, isBestSeller: true, isNewArrival: false, isLimitedEdition: true
  },
  {
    id: 'l6', name: 'Vanguard Duffle Bag', description: 'Full grain leather accents.',
    price: 9999, salePrice: null, category: 'Accessories', gender: 'Unisex', collection: 'Luxury',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    sizes: ['One Size'], colors: ['Matte Black'], stock: 5,
    material: 'Ballistic Nylon & Leather', fit: 'N/A', careInstructions: 'Spot clean.',
    isIconic: true, isBestSeller: false, isNewArrival: true, isLimitedEdition: true
  }
];