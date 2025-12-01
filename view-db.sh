#!/bin/bash

# Database Viewer Script
# Makes it easy to view your grocery store databases

PSQL="/opt/homebrew/opt/postgresql@15/bin/psql"
USER="sravankumarbodakonda"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Grocery Store Database Viewer ===${NC}\n"

# Function to show database tables
show_tables() {
    local db=$1
    echo -e "${GREEN}Tables in $db:${NC}"
    $PSQL -U $USER -d $db -c "\dt"
    echo ""
}

# Function to show sample data
show_sample() {
    local db=$1
    local table=$2
    local limit=${3:-5}
    echo -e "${GREEN}Sample data from $db.$table:${NC}"
    $PSQL -U $USER -d $db -c "SELECT * FROM $table LIMIT $limit;"
    echo ""
}

# Menu
case "$1" in
    "list"|"")
        echo "Available databases:"
        $PSQL -U $USER -l | grep grocerystore
        ;;
    "auth")
        show_tables "grocerystore_auth"
        show_sample "grocerystore_auth" "users" 10
        ;;
    "catalog")
        show_tables "grocerystore_catalog"
        show_sample "grocerystore_catalog" "products" 10
        show_sample "grocerystore_catalog" "categories" 10
        ;;
    "cart")
        show_tables "grocerystore_cart"
        show_sample "grocerystore_cart" "cart_items" 10
        ;;
    "order")
        show_tables "grocerystore_order"
        show_sample "grocerystore_order" "orders" 10
        ;;
    "payment")
        show_tables "grocerystore_payment"
        show_sample "grocerystore_payment" "payments" 10
        ;;
    "all")
        echo -e "${GREEN}=== All Databases Overview ===${NC}\n"
        for db in grocerystore_auth grocerystore_catalog grocerystore_cart grocerystore_order grocerystore_payment; do
            echo -e "${BLUE}--- $db ---${NC}"
            show_tables "$db"
        done
        ;;
    "users")
        $PSQL -U $USER -d grocerystore_auth -c "SELECT id, email, first_name, last_name, role, enabled FROM users;"
        ;;
    "products")
        $PSQL -U $USER -d grocerystore_catalog -c "SELECT id, name, price, stock_quantity, category_id FROM products ORDER BY id;"
        ;;
    "orders")
        $PSQL -U $USER -d grocerystore_order -c "SELECT id, order_number, user_id, total_amount, status, created_at FROM orders ORDER BY created_at DESC;"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: ./view-db.sh [command]"
        echo ""
        echo "Commands:"
        echo "  list      - List all databases (default)"
        echo "  auth      - Show auth database tables and users"
        echo "  catalog   - Show catalog database tables and products"
        echo "  cart      - Show cart database tables"
        echo "  order     - Show order database tables"
        echo "  payment   - Show payment database tables"
        echo "  all       - Show all databases"
        echo "  users     - Show all users"
        echo "  products  - Show all products"
        echo "  orders    - Show all orders"
        echo "  help      - Show this help"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Run './view-db.sh help' for usage"
        ;;
esac

