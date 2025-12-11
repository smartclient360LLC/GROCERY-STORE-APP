-- Create family_accounts table
CREATE TABLE family_accounts (
    id BIGSERIAL PRIMARY KEY,
    family_name VARCHAR(255) NOT NULL,
    created_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create family_members table - links users to family accounts
CREATE TABLE family_members (
    id BIGSERIAL PRIMARY KEY,
    family_account_id BIGINT NOT NULL REFERENCES family_accounts(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_role VARCHAR(50) NOT NULL DEFAULT 'MEMBER', -- OWNER, MEMBER, CHILD
    member_name VARCHAR(255), -- Display name (e.g., "Mom", "Dad", "John")
    preferences TEXT, -- JSON string for dietary preferences
    allergies TEXT, -- JSON array of allergies
    is_active BOOLEAN NOT NULL DEFAULT true,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(family_account_id, user_id)
);

-- Create shared_shopping_lists table
CREATE TABLE shared_shopping_lists (
    id BIGSERIAL PRIMARY KEY,
    family_account_id BIGINT NOT NULL REFERENCES family_accounts(id) ON DELETE CASCADE,
    list_name VARCHAR(255) NOT NULL, -- e.g., "Mom's List", "Weekly Groceries"
    created_by_user_id BIGINT NOT NULL REFERENCES users(id),
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create shared_list_items table
CREATE TABLE shared_list_items (
    id BIGSERIAL PRIMARY KEY,
    list_id BIGINT NOT NULL REFERENCES shared_shopping_lists(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    weight DECIMAL(10, 2), -- For weight-based items
    notes TEXT, -- Optional notes for the item
    added_by_user_id BIGINT NOT NULL REFERENCES users(id),
    is_checked BOOLEAN NOT NULL DEFAULT false, -- For checking off items
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_family_accounts_created_by ON family_accounts(created_by_user_id);
CREATE INDEX idx_family_members_family ON family_members(family_account_id);
CREATE INDEX idx_family_members_user ON family_members(user_id);
CREATE INDEX idx_shared_lists_family ON shared_shopping_lists(family_account_id);
CREATE INDEX idx_shared_lists_created_by ON shared_shopping_lists(created_by_user_id);
CREATE INDEX idx_shared_list_items_list ON shared_list_items(list_id);
CREATE INDEX idx_shared_list_items_product ON shared_list_items(product_id);

