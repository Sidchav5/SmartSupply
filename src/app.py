from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt
import os, json
from datetime import date

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Directory for sales logs
SALES_DIR = os.path.join(os.getcwd(), 'src', 'offline_sales_history')
os.makedirs(SALES_DIR, exist_ok=True)
SALES_ONLINE_DIR = os.path.join(os.getcwd(), 'src', 'online_sales_history')
os.makedirs(SALES_ONLINE_DIR, exist_ok=True)
# MySQL Connection
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Siddhesh@5",
    database="smart_supply"
)
cursor = conn.cursor(dictionary=True)

# Helper to get table by role
def get_table_by_role(role):
    mapping = {
        "Consumer": "consumers",
        "Marketplace Manager": "marketplace_managers",
        "Warehouse Manager": "warehouse_managers"
    }
    return mapping.get(role)

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name, email, password, role = data["name"], data["email"], data["password"], data["role"]
    table = get_table_by_role(role)

    if not table:
        return jsonify({"message": "Invalid role!"}), 400

    # Hash password
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    # Check if user already exists
    cursor.execute(f"SELECT * FROM {table} WHERE email = %s", (email,))
    if cursor.fetchone():
        return jsonify({"message": f"{role} already exists!"}), 400

    # Marketplace Manager: needs location and manager_id
    if role == "Marketplace Manager":
        location = data.get("location")
        manager_id = data.get("manager_id")

        if not location or not manager_id:
            return jsonify({"message": "Location and Manager ID required!"}), 400

        cursor.execute(
            f"INSERT INTO {table} (name, email, password, location, manager_id) VALUES (%s, %s, %s, %s, %s)",
            (name, email, hashed, location, manager_id)
        )
    else:
        cursor.execute(
            f"INSERT INTO {table} (name, email, password) VALUES (%s, %s, %s)",
            (name, email, hashed)
        )

    conn.commit()
    return jsonify({"message": f"{role} registered successfully!"})

# Login helper function
def login_user(table_name, email, password):
    query = f"SELECT * FROM {table_name} WHERE email = %s"
    cursor.execute(query, (email,))
    user = cursor.fetchone()
    if user and bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({"message": "Login successful", "role": user.get("role", ""), "name": user["name"]})
    return jsonify({"message": "Invalid credentials"}), 401

@app.route("/login/consumer", methods=["POST"])
def login_consumer():
    data = request.get_json()
    cursor.execute("SELECT * FROM consumers WHERE email = %s", (data["email"],))
    user = cursor.fetchone()
    
    if user and bcrypt.checkpw(data["password"].encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({
            "message": "Login successful",
            "role": "Consumer",
            "name": user["name"],
            "id": user["id"]  # ✅ Include consumer ID for frontend
        })
    
    return jsonify({"message": "Invalid credentials"}), 401


@app.route("/login/marketplace_manager", methods=["POST"])
def login_marketplace_manager():
    data = request.get_json()
    cursor.execute("SELECT * FROM marketplace_managers WHERE email = %s", (data["email"],))
    user = cursor.fetchone()
    
    if user and bcrypt.checkpw(data["password"].encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({
            "message": "Login successful",
            "role": "Marketplace Manager",
            "name": user["name"],
            "manager_id": user["manager_id"]  # ✅ return manager_id
        })
    return jsonify({"message": "Invalid credentials"}), 401


@app.route("/login/warehouse_manager", methods=["POST"])
def login_warehouse_manager():
    data = request.get_json()
    return login_user("warehouse_managers", data["email"], data["password"])



@app.route("/warehouse/add_product", methods=["POST"])
def add_product():
    data = request.get_json()
    product_id = data["product_id"]
    name = data["name"]
    total_quantity = data["total_quantity"]
    online_quantity = data["online_quantity"]
    price = data["price"]  # ✅ new field
    offline_allocations = data["offline_allocations"]
    image_base64 = data.get("image_base64")

    cursor.execute(
        "INSERT INTO products (id, name, total_quantity, price, image_base64) VALUES (%s, %s, %s, %s, %s)",
        (product_id, name, total_quantity, price, image_base64)
    )

    cursor.execute(
        "INSERT INTO online_inventory (product_id, quantity) VALUES (%s, %s)",
        (product_id, online_quantity)
    )

    for alloc in offline_allocations:
        cursor.execute("""
            INSERT INTO offline_inventory (product_id, manager_id, quantity, initial_quantity)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE 
                quantity = quantity + VALUES(quantity),
                initial_quantity = initial_quantity + VALUES(initial_quantity)
        """, (product_id, alloc["manager_id"], alloc["quantity"], alloc["quantity"]))

    conn.commit()
    return jsonify({"message": "Product and allocations added successfully!"})


@app.route("/warehouse/availability", methods=["GET"])
def product_availability():
    search_term = request.args.get("search", "").strip().lower()

    if search_term:
        query = """
            SELECT * FROM products 
            WHERE LOWER(name) LIKE %s OR CAST(id AS CHAR) LIKE %s
        """
        cursor.execute(query, (f"%{search_term}%", f"%{search_term}%"))
    else:
        cursor.execute("SELECT * FROM products")

    products = cursor.fetchall()

    # Online quantities
    cursor.execute("SELECT product_id, quantity FROM online_inventory")
    online = {r["product_id"]: r["quantity"] for r in cursor.fetchall()}

    # Offline allocations
    cursor.execute("SELECT product_id, manager_id, quantity FROM offline_inventory")
    off = cursor.fetchall()

    response = []
    for p in products:
        pid = p["id"]
        online_qty = online.get(pid, 0)
        prod_offline = [r for r in off if r["product_id"] == pid]

        store_details = [
            {"manager_id": r["manager_id"], "quantity": r["quantity"]}
            for r in prod_offline
        ]
        total_offline_allocated = sum(r["quantity"] for r in prod_offline)
        offline_left = p["total_quantity"] - online_qty - total_offline_allocated

        response.append({
            "id": pid,
            "name": p["name"],
            "total_quantity": p["total_quantity"],
            "created_at": p["created_at"],
            "price": p["price"],
            "online_quantity": online_qty,
            "offline_store_allocations": store_details,
            "offline_left": offline_left,
            "image_base64": p.get("image_base64")
        })

    return jsonify(response)
@app.route('/warehouse/update_product', methods=['POST'])
def update_product():
    data = request.json
    product_id = data.get('product_id')
    name = data.get('name')  # Optional
    total_quantity = data.get('total_quantity')
    online_quantity = data.get('online_quantity')
    price = data.get('price')  # <-- New field
    offline_allocations = data.get('offline_allocations')
    image_base64 = data.get('image_base64')

    cursor = conn.cursor()

    # Step 1: Ensure product exists
    cursor.execute("SELECT name FROM products WHERE id = %s", (product_id,))
    result = cursor.fetchone()
    if not result:
        return jsonify({'error': 'Product not found'}), 404
    if not name:
        name = result[0]

    # Step 2: Update products table (include price)
    cursor.execute("""
        UPDATE products
        SET name = %s, total_quantity = %s, price = %s, image_base64 = %s
        WHERE id = %s
    """, (name, total_quantity, price, image_base64, product_id))

    # Step 3: Update online_inventory only if it exists
    cursor.execute("SELECT 1 FROM online_inventory WHERE product_id = %s", (product_id,))
    if cursor.fetchone():
        cursor.execute("""
            UPDATE online_inventory
            SET quantity = %s
            WHERE product_id = %s
        """, (online_quantity, product_id))
    else:
        return jsonify({'error': 'Online inventory for this product not found'}), 400

    # Step 4: Update offline_inventory only for existing rows
    for allocation in offline_allocations:
        manager_id = allocation.get('manager_id')
        quantity = allocation.get('quantity')

        cursor.execute("""
            SELECT 1 FROM offline_inventory
            WHERE product_id = %s AND manager_id = %s
        """, (product_id, manager_id))
        if cursor.fetchone():
            cursor.execute("""
                UPDATE offline_inventory
                SET quantity = %s
                WHERE product_id = %s AND manager_id = %s
            """, (quantity, product_id, manager_id))
        else:
            return jsonify({'error': f'Offline inventory not found for manager {manager_id}'}), 400

    conn.commit()
    return jsonify({'message': 'Product updated successfully'})


@app.route('/warehouse/delete_product/<int:product_id>', methods=['DELETE', 'OPTIONS'])
def delete_product(product_id):
    cursor = conn.cursor()

    # Delete all dependent records first (respecting FK constraints)
    cursor.execute("DELETE FROM order_items WHERE product_id = %s", (product_id,))
    cursor.execute("DELETE FROM marketplace_sales WHERE product_id = %s", (product_id,))
    cursor.execute("DELETE FROM online_inventory WHERE product_id = %s", (product_id,))
    cursor.execute("DELETE FROM offline_inventory WHERE product_id = %s", (product_id,))
    
    # Then delete from products
    cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
    
    conn.commit()
    return jsonify({'message': f'Product {product_id} and related records deleted successfully'}), 200


@app.route("/marketplace/update-sales", methods=["POST"])
def update_sales():
    data = request.get_json()
    manager_id = data["manager_id"]
    product_id = data["product_id"]
    sold_quantity = int(data["sold_quantity"])

    today = date.today().isoformat()

    # 1. Get product name
    cursor.execute("SELECT name FROM products WHERE id = %s", (product_id,))
    product = cursor.fetchone()
    if not product:
        return jsonify({"error": "Product not found"}), 404
    product_name = product["name"]

    # 2. Insert/update sales record in DB
    cursor.execute("""
        INSERT INTO marketplace_sales
        (manager_id, product_id, sold_quantity, sale_date)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE sold_quantity = sold_quantity + VALUES(sold_quantity)
    """, (manager_id, product_id, sold_quantity, today))

    # 3. Update offline inventory
    cursor.execute("""
        UPDATE offline_inventory
        SET quantity = quantity - %s
        WHERE manager_id = %s AND product_id = %s
    """, (sold_quantity, manager_id, product_id))

    # 4. Get updated quantity after sale
    cursor.execute("""
        SELECT quantity FROM offline_inventory
        WHERE manager_id = %s AND product_id = %s
    """, (manager_id, product_id))
    remaining = cursor.fetchone()
    remaining_stock = remaining["quantity"] if remaining else 0

    conn.commit()

    # 5. Prepare log entry
    log_entry = {
        "manager_id": manager_id,
        "product_id": product_id,
        "product_name": product_name,
        "sold_quantity": sold_quantity,
        "remaining_stock": remaining_stock,
        "timestamp": date.today().isoformat()
    }

    # 6. Log to daily file
    log_file_path = os.path.join(SALES_DIR, f"{today}.json")
    if os.path.exists(log_file_path):
        with open(log_file_path, 'r+') as f:
            logs = json.load(f)
            logs.append(log_entry)
            f.seek(0)
            json.dump(logs, f, indent=2)
    else:
        with open(log_file_path, 'w') as f:
            json.dump([log_entry], f, indent=2)

    return jsonify({"message": "Sales updated and logged successfully!"})


@app.route("/marketplace/sales", methods=["GET"])
def get_sales():
    mid = request.args.get("manager_id")
    pid = request.args.get("product_id")
    today = date.today()
    cursor.execute("""
      SELECT sold_quantity FROM marketplace_sales
      WHERE manager_id=%s AND product_id=%s AND sale_date=%s
    """, (mid, pid, today))
    row = cursor.fetchone()
    return jsonify({"sold_quantity": row["sold_quantity"] if row else 0})

@app.route("/store/availability", methods=["GET"])
def store_availability():
    manager_id = request.args.get("manager_id")

    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.id, p.name, p.image_base64, oi.quantity, oi.initial_quantity
        FROM offline_inventory oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.manager_id = %s
    """, (manager_id,))

    rows = cursor.fetchall()
    products = []
    for row in rows:
        products.append({
    "id": row["id"],
    "name": row["name"],
    "image_base64": row["image_base64"],
    "allocated_stock": row["initial_quantity"],
    "current_stock": row["quantity"]
})


    return jsonify(products)

# Get all products for consumer with price and available online quantity
@app.route('/consumer/availability', methods=['GET'])
def consumer_availability():
    cursor.execute("""
        SELECT p.id, p.name, p.image_base64, p.price, oi.quantity AS online_quantity
        FROM products p
        LEFT JOIN online_inventory oi ON (p.id = oi.product_id)
    """)
    products = cursor.fetchall()
    return jsonify(products)

# Place order from consumer Cart
@app.route('/consumer/place_order', methods=['POST'])
def place_order():
    data = request.json

    app.logger.info(f"🔧 Incoming data payload: {data}")
    # Now check consumer_id presence
    cid = data.get('consumer_id')
    app.logger.info(f"🔧 consumer_id raw: {cid!r}, type: {type(cid)}")
    try:
        consumer_id = int(data.get('consumer_id'))
        name = data['name']
        address = data['address']
        payment_mode = data['payment_mode']
        cart = data['cart']
    except (KeyError, TypeError, ValueError) as e:
        return jsonify({"error": f"Invalid or missing data: {str(e)}"}), 400

    if not cart or not isinstance(cart, list):
        return jsonify({"error": "Cart must be a non-empty list"}), 400

    today = date.today().isoformat()

    try:
        # Validate inventory
        for item in cart:
            pid = int(item['product_id'])
            qty = int(item['quantity'])

            cursor.execute("SELECT quantity FROM online_inventory WHERE product_id = %s", (pid,))
            row = cursor.fetchone()
            if not row or row['quantity'] < qty:
                return jsonify({"error": f"Insufficient stock for product ID {pid}"}), 400

        # Compute total
        total_amount = round(sum(int(item['quantity']) * float(item['price']) for item in cart), 2)

        # Insert into `orders` table
        cursor.execute("""
            INSERT INTO orders (consumer_id, name, address, payment_mode, total_amount, order_date)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (consumer_id, name, address, payment_mode, total_amount, today))
        order_id = cursor.lastrowid

        # Insert order items and update inventory
        for item in cart:
            pid = int(item['product_id'])
            qty = int(item['quantity'])
            price = float(item['price'])

            cursor.execute("""
                INSERT INTO order_items (order_id, product_id, quantity, price_at_order)
                VALUES (%s, %s, %s, %s)
            """, (order_id, pid, qty, price))

            cursor.execute("""
                UPDATE online_inventory SET quantity = quantity - %s WHERE product_id = %s
            """, (qty, pid))

        conn.commit()

    except Exception as db_error:
        conn.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Database error: {repr(db_error)}"}), 500



    # ✅ Log the order in a JSON file for the day
    entry = {
        "consumer_id": consumer_id,
        "order_id": order_id,
        "name": name,
        "address": address,
        "payment_mode": payment_mode,
        "items": cart,
        "total": float(total_amount)
    }

    # Ensure directory exists
    os.makedirs(SALES_ONLINE_DIR, exist_ok=True)
    fname = os.path.join(SALES_ONLINE_DIR, f"{today}.json")

    try:
        if os.path.exists(fname):
            with open(fname, 'r+', encoding='utf-8') as f:
                try:
                    logs = json.load(f)
                except json.JSONDecodeError:
                    logs = []
                logs.append(entry)
                f.seek(0)
                json.dump(logs, f, indent=2)
                f.truncate()
        else:
            with open(fname, 'w', encoding='utf-8') as f:
                json.dump([entry], f, indent=2)
    except Exception as json_error:
        return jsonify({"error": f"Order placed but failed to log JSON: {str(json_error)}"}), 500

    return jsonify({"order_id": order_id, "total": total_amount})

if __name__ == "__main__":
    app.run(debug=True)
