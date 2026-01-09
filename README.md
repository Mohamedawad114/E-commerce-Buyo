# 🛒 E-Commerce Backend System (NestJS)

A scalable and production-ready E-commerce backend built with **NestJS**, focusing on clean architecture, performance, security, and scalability.

This project simulates a real-world e-commerce system with advanced backend concepts and best practices.

---

## 🚀 Tech Stack

- **Backend:** NestJS  
- **Database:** MongoDB + Mongoose  
- **Cache & Jobs:** Redis, BullMQ  
- **Payments:** Stripe  
- **Real-time:** Socket.io  
- **Deployment:** Docker & Nginx, AWS EC2, Watchtower  
- **File Storage:** AWS S3  

---

## 🧠 Architecture & Design

- Modular Architecture (NestJS Modules)  
- Clear separation of concerns (Controllers / Services / Repositories)  
- Strategy Pattern for Payments  
- Centralized Error Handling  
- Clean Code & SOLID Principles  
- High performance using caching & background jobs  

---

## 👤 Authentication & User Management

- Access & Refresh Tokens (JWT)  
- Session Management using Redis  
- Store active sessions and revoke them  
- Logout from all devices  
- Two-Factor Authentication (2FA) with QR code & Google Authenticator  
- Idempotency Keys stored in Redis to protect critical operations from duplicate requests  

---

## 🛍️ Products & Catalog

- Products / Categories / Brands management  
- Soft Delete  
- Wishlist & Reviews  
- Shopping Cart  
- Advanced Sorting (Price, Average Rating)  
- Optimized Search using Redis  

---

## 🧾 Orders & Coupons

**Orders:**  
- Full order lifecycle  
- Status tracking (Pending / Paid / Canceled)  
- Transactions for data consistency  

**Coupons:**  
- Fixed amount or percentage  
- Usage limits  
- TTL with Mongoose (auto-remove expired coupons)  

---

## 💳 Payments (Stripe)

- Payment Strategy Pattern (decoupled & extensible)  
- Stripe Checkout Sessions (secure hosted UI)  
- Webhook handling  
- Stripe Coupons & Refunds integration  

---

## 🔔 Background Jobs & Real-Time

- **BullMQ:**  
  - Order expiration handling (auto-cancel after 4 days)  
  - Stock rollback  
  - User banning jobs  

- **Socket.io:**  
  - Real-time notifications  
  - Live product updates  

---

## 📊 Admin Dashboard

- User management (Ban / Control)  
- Product analytics (Top-selling, Highest-rated, Low-stock)  
- Orders overview & revenue statistics  
- Optimized using Redis caching  

---

## 🏠 Home Endpoint

- Public endpoint (no authentication)  
- Returns top-selling products and highest-rated products  
- Cached using Redis for performance  

---

## ☁️ File Storage

- AWS S3  
- Upload using Presigned URLs  
- Direct upload from frontend (no server overhead)  

---

## 🧪 Testing

- Unit Tests  
- End-to-End (E2E) Tests  

---

## 🐳 Deployment & Infrastructure

- Dockerized application  
- Nginx as Reverse Proxy  
- Load Balancing across multiple instances  
- Watchtower for automated deployments  
- Hosted on AWS EC2  

---

## 🔒 Performance & Security Highlights

- Redis caching to reduce DB load  
- Idempotency for critical routes  
- Secure payment flow  
- Session-based security  
- Background processing for heavy tasks  

---

## 📌 Notes

This project focuses on:  
- Real-world backend challenges  
- High traffic readiness  
- Maintainable and scalable architecture  

---

## 📫 Author

**Mohamed Ahmed**  
Backend Developer – Node.js / NestJS  

---

## 📖 Postman Documentation

Full API documentation is available here:  
[Postman Docs](https://documenter.getpostman.com/view/44460916/2sBXVfiB5V)
