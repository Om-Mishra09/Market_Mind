const categoryImages = {
    'computers': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
    'laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
    'smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    'electronics': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
    'accessories': 'https://images.unsplash.com/photo-1576503918482-1436152a5ec2?auto=format&fit=crop&w=600&q=80',
    'home': 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=600&q=80',
    'default': 'https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=600&q=80'
};

export const getCategoryImage = (category) => {
    if (!category) return categoryImages['default'];

    // Normalize category
    // "Smart Phones" -> "smartphones"
    const normalized = category.toLowerCase().replace(/\s+/g, '');

    // Check for direct match or partial match
    if (categoryImages[normalized]) return categoryImages[normalized];

    // Fallback logic
    if (normalized.includes('home')) return categoryImages['home'];
    if (normalized.includes('computer')) return categoryImages['computers'];
    if (normalized.includes('phone')) return categoryImages['smartphones'];

    return categoryImages['default'];
};
