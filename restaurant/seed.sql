-- Restaurant Seed Data

-- Menu Items
INSERT INTO menu_items (name, description, category, price, image_placeholder, image_url) VALUES ('Garlic Bread', 'Crispy bread with garlic butter and herbs', 'Starters', 120, '🧄🍞', 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400');
INSERT INTO menu_items (name, description, category, price, image_placeholder, image_url) VALUES ('Soup of the Day', 'Chef''s special soup served with croutons', 'Starters', 150, '🍲', 'https://images.unsplash.com/photo-1547592165-e1d17fed6005?w=400');
INSERT INTO menu_items (name, description, category, price, image_placeholder, image_url) VALUES ('Grilled Chicken', 'Herb-marinated chicken breast with seasonal vegetables', 'Mains', 380, '🍗', 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400');
INSERT INTO menu_items (name, description, category, price, image_placeholder, image_url) VALUES ('Pasta Arrabiata', 'Penne in spicy tomato sauce with fresh basil', 'Mains', 290, '🍝', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400');
INSERT INTO menu_items (name, description, category, price, image_placeholder, image_url) VALUES ('Fresh Lime Soda', 'Freshly squeezed lime with soda water', 'Drinks', 80, '🍋', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400');
INSERT INTO menu_items (name, description, category, price, image_placeholder, image_url) VALUES ('Chocolate Lava Cake', 'Warm chocolate cake with molten center and vanilla ice cream', 'Desserts', 220, '🍫', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400');

-- Outlets
INSERT INTO outlets (name, address, phone, delivery_radius, delivery_charge, delivery_enabled, zomato_enabled, swiggy_enabled) VALUES ('Main Outlet', '123 Main Street', '+91-9876543210', 5.0, 40.0, 1, 1, 1);
