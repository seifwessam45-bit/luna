from flask import Flask, jsonify, request, send_from_directory
from pathlib import Path

app = Flask(__name__, static_folder="..", static_url_path="")

PRODUCTS = [
    {
        "id": 1,
        "name": "The Atelier Leather Tote",
        "category": "tote",
        "price": 78,
        "material": "Full-grain Tan Leather",
        "color": "Cognac / Warm Tan",
        "tag": "Best Seller",
        "description": "Handcrafted from full-grain vegetable-tanned leather, The Atelier Tote features a spacious interior, reinforced handles, and a magnetic brass closure. Designed to age gracefully.",
        "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85",
        "reviews": [
            {"author": "Nour H.", "rating": 5, "comment": "The leather quality is insane! Gets softer every single day.", "date": "Sep 22, 2026"},
            {"author": "Sara K.", "rating": 5, "comment": "Fits my 15-inch laptop comfortably without losing shape.", "date": "Sep 25, 2026"}
        ]
    },
    {
        "id": 2,
        "name": "Lunar Suede Crossbody",
        "category": "crossbody",
        "price": 54,
        "material": "Italian Suede & Leather",
        "color": "Terracotta",
        "tag": "New Season",
        "description": "A compact saddle crossbody bag crafted with soft Italian suede, antique gold hardware, and an adjustable shoulder strap.",
        "image": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=85",
        "reviews": [
            {"author": "Laila A.", "rating": 5, "comment": "The terracotta color is so unique and chic!", "date": "Sep 20, 2026"}
        ]
    },
    {
        "id": 3,
        "name": "Minimalist Bucket Bag",
        "category": "shoulder",
        "price": 65,
        "material": "Genuine Calfskin Leather",
        "color": "Ivory Cream",
        "tag": "Must Have",
        "description": "Architectural bucket silhouette featuring a hand-drawn drawstring closure, internal zip pocket, and structured bottom feet.",
        "image": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=85",
        "reviews": [
            {"author": "Salma M.", "rating": 5, "comment": "Obsessed with the cream color and drawstring detail.", "date": "Sep 24, 2026"}
        ]
    },
    {
        "id": 4,
        "name": "Woven Linen & Leather Shopper",
        "category": "tote",
        "price": 58,
        "material": "Heavyweight Linen & Leather",
        "color": "Natural Linen / Black",
        "tag": "Eco-Crafted",
        "description": "Organic linen body stitched with thick saddle-leather handles and reinforced base. Lightweight yet durable for market runs and weekend trips.",
        "image": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=85",
        "reviews": [
            {"author": "Dina E.", "rating": 5, "comment": "The perfect summer and beach tote!", "date": "Sep 15, 2026"}
        ]
    },
    {
        "id": 5,
        "name": "Velvet Evening Pouch",
        "category": "pouch",
        "price": 38,
        "material": "Plush Velvet & Silk Ribbon",
        "color": "Midnight Noir",
        "tag": "Limited Drop",
        "description": "Luxurious velvet drawstring pouch adorned with hand-braided handles and custom satin lining.",
        "image": "https://images.unsplash.com/photo-1575032617751-6dface0060fe?auto=format&fit=crop&w=800&q=85",
        "reviews": [
            {"author": "Yasmine K.", "rating": 5, "comment": "Turned heads at dinner! So delicate.", "date": "Sep 26, 2026"}
        ]
    },
    {
        "id": 6,
        "name": "Vintage Saddle Shoulder Bag",
        "category": "shoulder",
        "price": 72,
        "material": "Hand-buffed Antique Leather",
        "color": "Chestnut Brown",
        "tag": "Handcrafted",
        "description": "Timeless flap design with magnetic buckle clasp, internal divider, and back slip pocket. Hand-stitched with waxed linen thread.",
        "image": "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=85",
        "reviews": [
            {"author": "Fatma G.", "rating": 5, "comment": "Smells like genuine artisan leather! Premium feel.", "date": "Sep 21, 2026"}
        ]
    }
]

def format_product(p):
    reviews = p.get("reviews", [])
    avg_rating = round(sum(r["rating"] for r in reviews) / len(reviews), 1) if reviews else 5.0
    return {
        **p,
        "rating": avg_rating,
        "review_count": len(reviews)
    }

@app.get("/")
def home():
    return send_from_directory("..", "index.html")

@app.get("/api/products")
def products():
    return jsonify([format_product(p) for p in PRODUCTS])

@app.get("/api/products/<int:product_id>")
def get_product(product_id):
    product = next((p for p in PRODUCTS if p["id"] == product_id), None)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(format_product(product))

@app.post("/api/products/<int:product_id>/reviews")
def add_review(product_id):
    product = next((p for p in PRODUCTS if p["id"] == product_id), None)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    data = request.get_json(silent=True) or {}
    author = data.get("author", "").strip() or "Anonymous"
    rating = int(data.get("rating", 5))
    comment = data.get("comment", "").strip()
    
    if not comment:
        return jsonify({"error": "Review comment cannot be empty"}), 400
        
    new_review = {
        "author": author,
        "rating": min(max(rating, 1), 5),
        "comment": comment,
        "date": "Just now"
    }
    product["reviews"].insert(0, new_review)
    return jsonify({"success": True, "review": new_review, "product": format_product(product)})

@app.get("/api/reviews/featured")
def featured_reviews():
    all_reviews = []
    for p in PRODUCTS:
        for r in p.get("reviews", []):
            all_reviews.append({**r, "product_name": p["name"], "product_image": p["image"]})
    return jsonify(all_reviews)

BAGS = [
    {
        "id": 101,
        "name": "The Atelier Leather Tote",
        "category": "tote",
        "price": 78,
        "material": "Full-grain Tan Leather",
        "color": "Cognac / Warm Tan",
        "tag": "Best Seller",
        "description": "Handcrafted from full-grain vegetable-tanned leather, The Atelier Tote features a spacious interior, reinforced handles, and a magnetic brass closure. Designed to age gracefully.",
        "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85",
        "reviews": [
            {"author": "Nour H.", "rating": 5, "comment": "The leather quality is insane! Gets softer every single day.", "date": "Sep 22, 2026"},
            {"author": "Sara K.", "rating": 5, "comment": "Fits my 15-inch laptop comfortably without losing shape.", "date": "Sep 25, 2026"}
        ]
    },
    {
        "id": 102,
        "name": "Lunar Suede Crossbody",
        "category": "crossbody",
        "price": 54,
        "material": "Italian Suede & Leather",
        "color": "Terracotta",
        "tag": "New Season",
        "description": "A compact saddle crossbody bag crafted with soft Italian suede, antique gold hardware, and an adjustable shoulder strap.",
        "image": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=85",
        "reviews": [
            {"author": "Laila A.", "rating": 5, "comment": "The terracotta color is so unique and chic!", "date": "Sep 20, 2026"}
        ]
    },
    {
        "id": 103,
        "name": "Minimalist Bucket Bag",
        "category": "shoulder",
        "price": 65,
        "material": "Genuine Calfskin Leather",
        "color": "Ivory Cream",
        "tag": "Must Have",
        "description": "Architectural bucket silhouette featuring a hand-drawn drawstring closure, internal zip pocket, and structured bottom feet.",
        "image": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=85",
        "reviews": [
            {"author": "Salma M.", "rating": 5, "comment": "Obsessed with the cream color and drawstring detail.", "date": "Sep 24, 2026"}
        ]
    },
    {
        "id": 104,
        "name": "Woven Linen & Leather Shopper",
        "category": "tote",
        "price": 58,
        "material": "Heavyweight Linen & Leather",
        "color": "Natural Linen / Black",
        "tag": "Eco-Crafted",
        "description": "Organic linen body stitched with thick saddle-leather handles and reinforced base. Lightweight yet durable for market runs and weekend trips.",
        "image": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=85",
        "reviews": [
            {"author": "Dina E.", "rating": 5, "comment": "The perfect summer and beach tote!", "date": "Sep 15, 2026"}
        ]
    },
    {
        "id": 105,
        "name": "Velvet Evening Pouch",
        "category": "pouch",
        "price": 38,
        "material": "Plush Velvet & Silk Ribbon",
        "color": "Midnight Noir",
        "tag": "Limited Drop",
        "description": "Luxurious velvet drawstring pouch adorned with hand-braided handles and custom satin lining.",
        "image": "https://images.unsplash.com/photo-1575032617751-6dface0060fe?auto=format&fit=crop&w=800&q=85",
        "reviews": [
            {"author": "Yasmine K.", "rating": 5, "comment": "Turned heads at dinner! So delicate.", "date": "Sep 26, 2026"}
        ]
    },
    {
        "id": 106,
        "name": "Vintage Saddle Shoulder Bag",
        "category": "shoulder",
        "price": 72,
        "material": "Hand-buffed Antique Leather",
        "color": "Chestnut Brown",
        "tag": "Handcrafted",
        "description": "Timeless flap design with magnetic buckle clasp, internal divider, and back slip pocket. Hand-stitched with waxed linen thread.",
        "image": "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=85",
        "reviews": [
            {"author": "Fatma G.", "rating": 5, "comment": "Smells like genuine artisan leather! Premium feel.", "date": "Sep 21, 2026"}
        ]
    }
]

@app.get("/bags")
def bags_page():
    return send_from_directory("..", "bags.html")

@app.get("/api/bags")
def get_bags():
    category = request.args.get("category", "all")
    if category and category != "all":
        filtered = [b for b in BAGS if b["category"] == category]
    else:
        filtered = BAGS
    return jsonify([format_product(b) for b in filtered])

@app.get("/api/bags/<int:bag_id>")
def get_bag(bag_id):
    bag = next((b for b in BAGS if b["id"] == bag_id), None)
    if not bag:
        return jsonify({"error": "Bag not found"}), 404
    return jsonify(format_product(bag))

@app.post("/api/custom-bag-order")
def custom_bag_order():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    details = data.get("details", "").strip()

    if not name or not email or not details:
        return jsonify({"success": False, "message": "Please fill in all fields."}), 400

    return jsonify({
        "success": True,
        "message": f"Thank you {name}! Your custom bag request has been received. Our artisan team will contact you at {email} within 24 hours. ♡"
    })

@app.post("/api/orders")
def create_order():
    data = request.get_json(silent=True) or {}
    item_ids = data.get("items", [])

    all_catalog = PRODUCTS + BAGS
    selected = [p for p in all_catalog if p["id"] in item_ids]
    total = sum(p["price"] for p in selected)

    return jsonify({
        "success": True,
        "message": f"Order created successfully — total ${total} (demo checkout)."
    })

@app.post("/api/newsletter")
def newsletter():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()

    if not email or "@" not in email:
        return jsonify({"success": False, "message": "Please enter a valid email."}), 400

    return jsonify({
        "success": True,
        "message": f"Welcome to LUNA, {email} ♡"
    })

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=3000)

