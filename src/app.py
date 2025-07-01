from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt

app = Flask(__name__)
CORS(app)

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
    return login_user("consumers", data["email"], data["password"])

@app.route("/login/marketplace_manager", methods=["POST"])
def login_marketplace_manager():
    data = request.get_json()
    return login_user("marketplace_managers", data["email"], data["password"])

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
    offline_allocations = data["offline_allocations"]  # [{manager_id: "MP001", quantity: 10}, ...]
    image_base64 = data.get("image_base64")  # Optional


    # Insert product
    cursor.execute(
    "INSERT INTO products (id, name, total_quantity, image_base64) VALUES (%s, %s, %s, %s)",
    (product_id, name, total_quantity, image_base64)
)


    # Insert online allocation
    cursor.execute(
        "INSERT INTO online_inventory (product_id, quantity) VALUES (%s, %s)",
        (product_id, online_quantity)
    )

    # Insert offline allocations
    for alloc in offline_allocations:
        cursor.execute(
            "INSERT INTO offline_inventory (product_id, manager_id, quantity) VALUES (%s, %s, %s)",
            (product_id, alloc["manager_id"], alloc["quantity"])
        )

    conn.commit()
    return jsonify({"message": "Product and allocations added successfully!"})

@app.route("/warehouse/availability", methods=["GET"])
def product_availability():
    search_term = request.args.get("search", "").strip().lower()

    # Build query with optional search filter
    if search_term:
        query = """
            SELECT * FROM products 
            WHERE LOWER(name) LIKE %s OR LOWER(id) LIKE %s
        """
        cursor.execute(query, (f"%{search_term}%", f"%{search_term}%"))
    else:
        cursor.execute("SELECT * FROM products")
    
    products = cursor.fetchall()

    # Online quantities
    cursor.execute("SELECT product_id, quantity FROM online_inventory")
    online = {r["product_id"]: r["quantity"] for r in cursor.fetchall()}

    # Offline allocations aggregated per product & per store
    cursor.execute("SELECT product_id, manager_id, quantity FROM offline_inventory")
    off = cursor.fetchall()

    response = []
    for p in products:
        pid = p["id"]
        prod_offline = [r for r in off if r["product_id"] == pid]
        store_details = [
            {"manager_id": r["manager_id"], "quantity": r["quantity"]}
            for r in prod_offline
        ]
        response.append({
            "id": pid,
            "name": p["name"],
            "total_quantity": p["total_quantity"],
            "created_at": p["created_at"],
            "online_quantity": online.get(pid, 0),
            "offline_store_allocations": store_details,
            "image_base64": p.get("image_base64")
        })

    return jsonify(response)


if __name__ == "__main__":
    app.run(debug=True)
