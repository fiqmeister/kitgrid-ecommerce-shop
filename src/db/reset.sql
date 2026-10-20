USE kitgrid;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS refresh_tokens, product_tags, cart_items, order_status_history,
    order_items, orders, product_variants, products, categories, tags,
    team_profiles, users, bulk_discount_rules;
SET FOREIGN_KEY_CHECKS = 1;