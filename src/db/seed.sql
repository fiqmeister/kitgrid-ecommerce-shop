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

-- more products (ids 9 to 16) so the Kit Advisor can build a full team kit
INSERT INTO products (id, name, description, base_price, pitch_surface, material, weight_grams, skill_level, durability_rating, category_id) VALUES
    (9, 'Match Shorts', 'Lightweight match shorts with an elastic waist.', 24.00, NULL, 'Polyester', 110, 'amateur', 4, 1),
    (10, 'Match Socks', 'Cushioned knee-length match socks.', 9.90, NULL, 'Nylon and cotton', 70, 'amateur', 3, 1),
    (11, 'Goalkeeper Jersey', 'Long-sleeve padded goalkeeper jersey.', 42.00, NULL, 'Polyester', 220, 'amateur', 4, 1),
    (12, 'Training Tee', 'Quick-dry tee for training sessions.', 19.90, NULL, 'Polyester', 130, 'amateur', 4, 2),
    (13, 'Quarter-Zip Training Top', 'Warm quarter-zip top for training and travel.', 45.00, NULL, 'Polyester and elastane', 300, 'amateur', 4, 2),
    (14, 'Training Football', 'Durable training ball in sizes 3, 4 and 5.', 19.90, 'all', 'Machine-stitched PU', 400, 'youth', 5, 3),
    (15, 'Staff Polo', 'Smart polo for coaches and team staff.', 32.00, NULL, 'Cotton pique', 220, NULL, 4, 4),
    (16, 'Kit Bag', 'Drawstring bag for boots and kit.', 12.00, NULL, 'Nylon', 150, NULL, 4, 3);

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

-- more variants (ids 18 and up). Added after the ones above so variants 1 to 17 keep their ids.
-- sizes: mini_junior 4-5Y/6-7Y, youth Youth XS-L, senior S-XL
-- stock is mixed on purpose: plenty for most, some at or below the threshold, a few at 0
INSERT INTO product_variants (sku, size, colour, age_group, stock, low_stock_threshold, product_id) VALUES
    -- 1. Matchday Jersey: Navy in mini and youth sizes, Red in youth and senior sizes
    ('KG-MJ-NVY-45', '4-5Y', 'Navy', 'mini_junior', 20, 10, 1),
    ('KG-MJ-NVY-67', '6-7Y', 'Navy', 'mini_junior', 24, 10, 1),
    ('KG-MJ-NVY-YXS', 'Youth XS', 'Navy', 'youth', 30, 10, 1),
    ('KG-MJ-NVY-YS', 'Youth S', 'Navy', 'youth', 40, 10, 1),
    ('KG-MJ-NVY-YM', 'Youth M', 'Navy', 'youth', 36, 10, 1),
    ('KG-MJ-NVY-YL', 'Youth L', 'Navy', 'youth', 28, 10, 1),
    ('KG-MJ-RED-YXS', 'Youth XS', 'Red', 'youth', 0, 10, 1),
    ('KG-MJ-RED-YS', 'Youth S', 'Red', 'youth', 18, 10, 1),
    ('KG-MJ-RED-YM', 'Youth M', 'Red', 'youth', 22, 10, 1),
    ('KG-MJ-RED-YL', 'Youth L', 'Red', 'youth', 15, 10, 1),
    ('KG-MJ-RED-S', 'S', 'Red', 'senior', 14, 10, 1),
    ('KG-MJ-RED-M', 'M', 'Red', 'senior', 3, 10, 1),
    ('KG-MJ-RED-L', 'L', 'Red', 'senior', 16, 10, 1),
    ('KG-MJ-RED-XL', 'XL', 'Red', 'senior', 9, 10, 1),
    -- 3. Training Shorts: youth sizes
    ('KG-TS-BLK-YXS', 'Youth XS', 'Black', 'youth', 25, 10, 3),
    ('KG-TS-BLK-YS', 'Youth S', 'Black', 'youth', 30, 10, 3),
    ('KG-TS-BLK-YM', 'Youth M', 'Black', 'youth', 30, 10, 3),
    ('KG-TS-BLK-YL', 'Youth L', 'Black', 'youth', 20, 10, 3),
    -- 9. Match Shorts
    ('KG-MS-NVY-YXS', 'Youth XS', 'Navy', 'youth', 30, 10, 9),
    ('KG-MS-NVY-YS', 'Youth S', 'Navy', 'youth', 40, 10, 9),
    ('KG-MS-NVY-YM', 'Youth M', 'Navy', 'youth', 40, 10, 9),
    ('KG-MS-NVY-YL', 'Youth L', 'Navy', 'youth', 30, 10, 9),
    ('KG-MS-NVY-S', 'S', 'Navy', 'senior', 20, 10, 9),
    ('KG-MS-NVY-M', 'M', 'Navy', 'senior', 25, 10, 9),
    ('KG-MS-NVY-L', 'L', 'Navy', 'senior', 20, 10, 9),
    ('KG-MS-NVY-XL', 'XL', 'Navy', 'senior', 12, 10, 9),
    ('KG-MS-WHT-YXS', 'Youth XS', 'White', 'youth', 15, 10, 9),
    ('KG-MS-WHT-YS', 'Youth S', 'White', 'youth', 20, 10, 9),
    ('KG-MS-WHT-YM', 'Youth M', 'White', 'youth', 20, 10, 9),
    ('KG-MS-WHT-YL', 'Youth L', 'White', 'youth', 15, 10, 9),
    ('KG-MS-WHT-S', 'S', 'White', 'senior', 12, 10, 9),
    ('KG-MS-WHT-M', 'M', 'White', 'senior', 15, 10, 9),
    ('KG-MS-WHT-L', 'L', 'White', 'senior', 12, 10, 9),
    ('KG-MS-WHT-XL', 'XL', 'White', 'senior', 8, 10, 9),
    ('KG-MS-RED-YXS', 'Youth XS', 'Red', 'youth', 10, 10, 9),
    ('KG-MS-RED-YS', 'Youth S', 'Red', 'youth', 18, 10, 9),
    ('KG-MS-RED-YM', 'Youth M', 'Red', 'youth', 18, 10, 9),
    ('KG-MS-RED-YL', 'Youth L', 'Red', 'youth', 14, 10, 9),
    ('KG-MS-RED-S', 'S', 'Red', 'senior', 12, 10, 9),
    ('KG-MS-RED-M', 'M', 'Red', 'senior', 14, 10, 9),
    ('KG-MS-RED-L', 'L', 'Red', 'senior', 10, 10, 9),
    ('KG-MS-RED-XL', 'XL', 'Red', 'senior', 6, 10, 9),
    -- 10. Match Socks
    ('KG-SK-NVY-Y', 'Youth', 'Navy', 'youth', 80, 10, 10),
    ('KG-SK-NVY-A', 'Adult', 'Navy', 'senior', 60, 10, 10),
    ('KG-SK-RED-Y', 'Youth', 'Red', 'youth', 50, 10, 10),
    ('KG-SK-RED-A', 'Adult', 'Red', 'senior', 40, 10, 10),
    ('KG-SK-WHT-Y', 'Youth', 'White', 'youth', 30, 10, 10),
    ('KG-SK-WHT-A', 'Adult', 'White', 'senior', 4, 10, 10),
    -- 11. Goalkeeper Jersey
    ('KG-GJ-GRN-YS', 'Youth S', 'Green', 'youth', 8, 5, 11),
    ('KG-GJ-GRN-YM', 'Youth M', 'Green', 'youth', 2, 5, 11),
    ('KG-GJ-GRN-YL', 'Youth L', 'Green', 'youth', 6, 5, 11),
    ('KG-GJ-GRN-S', 'S', 'Green', 'senior', 6, 5, 11),
    ('KG-GJ-GRN-M', 'M', 'Green', 'senior', 8, 5, 11),
    ('KG-GJ-GRN-L', 'L', 'Green', 'senior', 7, 5, 11),
    ('KG-GJ-GRN-XL', 'XL', 'Green', 'senior', 3, 5, 11),
    ('KG-GJ-ORG-YS', 'Youth S', 'Orange', 'youth', 6, 5, 11),
    ('KG-GJ-ORG-YM', 'Youth M', 'Orange', 'youth', 6, 5, 11),
    ('KG-GJ-ORG-YL', 'Youth L', 'Orange', 'youth', 5, 5, 11),
    ('KG-GJ-ORG-S', 'S', 'Orange', 'senior', 5, 5, 11),
    ('KG-GJ-ORG-M', 'M', 'Orange', 'senior', 7, 5, 11),
    ('KG-GJ-ORG-L', 'L', 'Orange', 'senior', 6, 5, 11),
    ('KG-GJ-ORG-XL', 'XL', 'Orange', 'senior', 0, 5, 11),
    -- 12. Training Tee
    ('KG-TT-BLK-67', '6-7Y', 'Black', 'mini_junior', 20, 10, 12),
    ('KG-TT-BLK-YXS', 'Youth XS', 'Black', 'youth', 25, 10, 12),
    ('KG-TT-BLK-YS', 'Youth S', 'Black', 'youth', 35, 10, 12),
    ('KG-TT-BLK-YM', 'Youth M', 'Black', 'youth', 35, 10, 12),
    ('KG-TT-BLK-YL', 'Youth L', 'Black', 'youth', 25, 10, 12),
    ('KG-TT-BLK-S', 'S', 'Black', 'senior', 30, 10, 12),
    ('KG-TT-BLK-M', 'M', 'Black', 'senior', 35, 10, 12),
    ('KG-TT-BLK-L', 'L', 'Black', 'senior', 30, 10, 12),
    ('KG-TT-BLK-XL', 'XL', 'Black', 'senior', 15, 10, 12),
    ('KG-TT-GRY-67', '6-7Y', 'Grey', 'mini_junior', 10, 10, 12),
    ('KG-TT-GRY-YXS', 'Youth XS', 'Grey', 'youth', 15, 10, 12),
    ('KG-TT-GRY-YS', 'Youth S', 'Grey', 'youth', 20, 10, 12),
    ('KG-TT-GRY-YM', 'Youth M', 'Grey', 'youth', 20, 10, 12),
    ('KG-TT-GRY-YL', 'Youth L', 'Grey', 'youth', 15, 10, 12),
    ('KG-TT-GRY-S', 'S', 'Grey', 'senior', 18, 10, 12),
    ('KG-TT-GRY-M', 'M', 'Grey', 'senior', 6, 10, 12),
    ('KG-TT-GRY-L', 'L', 'Grey', 'senior', 18, 10, 12),
    ('KG-TT-GRY-XL', 'XL', 'Grey', 'senior', 10, 10, 12),
    -- 13. Quarter-Zip Training Top
    ('KG-QZ-NVY-YS', 'Youth S', 'Navy', 'youth', 10, 5, 13),
    ('KG-QZ-NVY-YM', 'Youth M', 'Navy', 'youth', 12, 5, 13),
    ('KG-QZ-NVY-YL', 'Youth L', 'Navy', 'youth', 10, 5, 13),
    ('KG-QZ-NVY-S', 'S', 'Navy', 'senior', 10, 5, 13),
    ('KG-QZ-NVY-M', 'M', 'Navy', 'senior', 12, 5, 13),
    ('KG-QZ-NVY-L', 'L', 'Navy', 'senior', 10, 5, 13),
    ('KG-QZ-NVY-XL', 'XL', 'Navy', 'senior', 6, 5, 13),
    ('KG-QZ-BLK-YS', 'Youth S', 'Black', 'youth', 8, 5, 13),
    ('KG-QZ-BLK-YM', 'Youth M', 'Black', 'youth', 8, 5, 13),
    ('KG-QZ-BLK-YL', 'Youth L', 'Black', 'youth', 6, 5, 13),
    ('KG-QZ-BLK-S', 'S', 'Black', 'senior', 8, 5, 13),
    ('KG-QZ-BLK-M', 'M', 'Black', 'senior', 4, 5, 13),
    ('KG-QZ-BLK-L', 'L', 'Black', 'senior', 8, 5, 13),
    ('KG-QZ-BLK-XL', 'XL', 'Black', 'senior', 5, 5, 13),
    -- 14. Training Football: size 3 for minis, 4 for youth, 5 for seniors
    ('KG-TF-WHT-3', '3', 'White', 'mini_junior', 0, 5, 14),
    ('KG-TF-WHT-4', '4', 'White', 'youth', 40, 5, 14),
    ('KG-TF-WHT-5', '5', 'White', 'senior', 35, 5, 14),
    -- 15. Staff Polo
    ('KG-SP-NVY-S', 'S', 'Navy', 'senior', 10, 5, 15),
    ('KG-SP-NVY-M', 'M', 'Navy', 'senior', 14, 5, 15),
    ('KG-SP-NVY-L', 'L', 'Navy', 'senior', 12, 5, 15),
    ('KG-SP-NVY-XL', 'XL', 'Navy', 'senior', 4, 5, 15),
    ('KG-SP-WHT-S', 'S', 'White', 'senior', 8, 5, 15),
    ('KG-SP-WHT-M', 'M', 'White', 'senior', 10, 5, 15),
    ('KG-SP-WHT-L', 'L', 'White', 'senior', 8, 5, 15),
    ('KG-SP-WHT-XL', 'XL', 'White', 'senior', 6, 5, 15),
    -- 16. Kit Bag
    ('KG-KB-NVY-OS', 'One size', 'Navy', NULL, 40, 10, 16),
    ('KG-KB-BLK-OS', 'One size', 'Black', NULL, 35, 10, 16);

-- 4. tags, then the links between products and tags
INSERT INTO tags (id, name) VALUES
    (1, 'jersey'), (2, 'matchday'), (3, 'breathable'),
    (4, 'training'), (5, 'goalkeeper'), (6, 'recovery'), (7, 'coach'),
    (8, 'socks');

INSERT INTO product_tags (product_id, tag_id) VALUES
    (1, 1), (1, 2), (1, 3),
    (2, 2),
    (3, 4), (3, 3),
    (4, 4),
    (5, 5),
    (6, 4),
    (7, 7),
    (8, 6),
    (9, 2),
    (10, 2), (10, 8),
    (11, 1), (11, 2), (11, 5),
    (12, 4), (12, 3),
    (13, 4),
    (14, 4),
    (15, 7),
    (16, 4);