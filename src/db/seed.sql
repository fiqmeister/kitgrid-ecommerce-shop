USE kitgrid;

-- 1. no dependencies
INSERT INTO categories (id, name) VALUES
    (1, 'Matchday Kits'),
    (2, 'Training Wear'),
    (3, 'Training Equipment'),
    (4, 'Coach & Staff Apparel');

INSERT INTO bulk_discount_rules (min_quantity, discount_percent) VALUES
    (10, 10.00),
    (15, 15.00),
    (25, 20.00);

-- 2. users, then the team profile that points to a user
INSERT INTO users (id, name, email, password_hash, role) VALUES
    (1, 'KitGrid Admin', 'admin@kitgrid.example', '$2b$10$iqKUA/I61y0FgvUkfng5kuznqWmqoYxC5dN52psy3nMk93pVGjlzC', 'admin'),
    (2, 'Ravi Nair', 'ravi.nair@example.com', '$2b$10$l20CwS6GFsz.cd8s0EAEMugOafJe1NKGSyJ85xdgwW.XKdBjUuzom', 'customer');

INSERT INTO team_profiles (team_name, age_group, squad_size, colours, user_id) VALUES
    ('Bedok Youth FC', 'youth', 18, 'Navy and white', 2);

-- 3. products (ids 1 to 8), then their variants
INSERT INTO products (id, name, description, base_price, pitch_surface, material, weight_grams, skill_level, durability_rating, category_id) VALUES
    (1, 'Matchday Jersey', 'Lightweight, breathable match jersey.', 38.00, NULL, 'Polyester', 150, 'amateur', 4, 1),
    (2, 'Match Football', 'Size 5 match ball.', 29.90, 'all', 'Synthetic leather', 430, 'amateur', 4, 3),
    (3, 'Training Shorts', 'Light shorts for training sessions.', 22.00, NULL, 'Polyester', 120, 'amateur', 4, 2),
    (4, 'Training Bib', 'Mesh bib to split squads in drills.', 9.50, NULL, 'Mesh polyester', 60, 'amateur', 3, 2),
    (5, 'Goalkeeper Gloves', 'Latex palm gloves with a wrist strap.', 32.50, NULL, 'Latex and foam', 180, 'amateur', 4, 3),
    (6, 'Marker Cones (set of 20)', 'Stackable cones for drills.', 18.00, 'all', 'Plastic', 600, NULL, 5, 3),
    (8, 'Recovery Foam Roller', 'Foam roller for post-session recovery.', 24.00, NULL, 'EVA foam', 550, NULL, 4, 3);

-- the jacket is not bulk eligible, so it needs the extra column
INSERT INTO products (id, name, description, base_price, pitch_surface, material, weight_grams, skill_level, durability_rating, is_bulk_eligible, category_id) VALUES
    (7, 'Coach Padded Jacket', 'Warm padded jacket for the touchline.', 64.00, NULL, 'Polyester and fleece', 650, NULL, 4, 0, 4);

INSERT INTO product_variants (sku, size, colour, age_group, stock, low_stock_threshold, product_id) VALUES
    ('KG-MJ-NVY-S', 'S', 'Navy', 'senior', 12, 10, 1),
    ('KG-MJ-NVY-M', 'M', 'Navy', 'senior', 4, 10, 1),
    ('KG-MJ-NVY-L', 'L', 'Navy', 'senior', 20, 10, 1),
    ('KG-MF-WHT-5', '5', 'White', NULL, 30, 5, 2),
    ('KG-TS-BLK-S', 'S', 'Black', 'senior', 15, 10, 3),
    ('KG-TS-BLK-M', 'M', 'Black', 'senior', 18, 10, 3),
    ('KG-TS-BLK-L', 'L', 'Black', 'senior', 7, 10, 3),
    ('KG-TB-YEL-OS', 'One size', 'Yellow', NULL, 40, 10, 4),
    ('KG-TB-ORG-OS', 'One size', 'Orange', NULL, 50, 10, 4),
    ('KG-GG-BLK-7', '7', 'Black', 'youth', 9, 5, 5),
    ('KG-GG-BLK-8', '8', 'Black', 'senior', 12, 5, 5),
    ('KG-GG-BLK-9', '9', 'Black', 'senior', 6, 5, 5),
    ('KG-MC-ORG-OS', 'One size', 'Orange', NULL, 63, 10, 6),
    ('KG-CJ-NVY-M', 'M', 'Navy', 'senior', 8, 5, 7),
    ('KG-CJ-NVY-L', 'L', 'Navy', 'senior', 6, 5, 7),
    ('KG-CJ-NVY-XL', 'XL', 'Navy', 'senior', 4, 5, 7),
    ('KG-FR-BLK-OS', 'One size', 'Black', NULL, 22, 5, 8);

-- 4. tags, then the links between products and tags
INSERT INTO tags (id, name) VALUES
    (1, 'jersey'), (2, 'matchday'), (3, 'breathable'),
    (4, 'training'), (5, 'goalkeeper'), (6, 'recovery'), (7, 'coach');

INSERT INTO product_tags (product_id, tag_id) VALUES
    (1, 1), (1, 2), (1, 3),
    (2, 2),
    (3, 4), (3, 3),
    (4, 4),
    (5, 5),
    (6, 4),
    (7, 7),
    (8, 6);