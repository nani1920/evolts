# ⚡ Evolts Backend API

> An enterprise-grade, high-performance RESTful API powering the Evolts Electric Vehicle (EV) Charging Station Locator and Slot Booking platform.

[![Node.js Version](https://img.shields.io/badge/node.js-%3E%3D18.0.0-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express.js Version](https://img.shields.io/badge/express.js-%5E5.2.1-lightgrey.svg?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%5E7.2.0-green.svg?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-blue.svg?style=for-the-badge&logo=json-web-tokens)](https://jwt.io/)
[![Zod](https://img.shields.io/badge/Zod-Validation-purple.svg?style=for-the-badge&logo=zod)](https://zod.dev/)

---

## 📖 Table of Contents
* [Architecture Overview](#-architecture-overview)
* [Core Features](#core-features)
* [Directory Structure](#-directory-structure)
* [Database Model Schemas](#-database-model-schemas)
  * [User Schema](#user-schema)
  * [Station Schema](#station-schema)
  * [Booking Schema](#booking-schema)
* [Business Rules & Logic](#-business-rules--logic)
  * [Booking Integrity Rules](#booking-integrity-rules)
  * [State Machine Transitions](#state-machine-transitions)
* [API Reference](#-api-reference)
  * [Authentication Endpoints (`/auth`)](#authentication-endpoints-auth)
  * [Station Endpoints (`/station`)](#station-endpoints-station)
  * [Booking Endpoints (`/booking`)](#booking-endpoints-booking)
* [Getting Started](#-getting-started)
  * [Prerequisites](#prerequisites)
  * [Environment Configuration](#environment-configuration)
  * [Installation & Execution](#installation--execution)

---

## 🏗️ Architecture Overview

The Evolts API is designed using the **Layered Service-Repository Pattern**, enforcing clean separation of concerns, high testability, and scalability.

### Request Lifecycle Flow
1. **Client Request**: Initiates an HTTP request to the API.
2. **Routing & Middleware**:
   * **Authentication**: Verifies JWT signatures and user role claims.
   * **Validation**: Sanitizes and validates request bodies, queries, and parameters via Zod.
3. **Controller Layer**: Decoupled request handler, extracts payloads, and delegates tasks to the services.
4. **Service Layer**: Contains core business logic, validation rules, and interacts with repositories.
5. **Repository Layer**: Executes operations on the MongoDB database.
6. **Response**: Controllers return standardized JSON responses.

---

## Core Features

- Secure Authentication & Authorization using JWT and Role-Based Access Control (RBAC).
- Geospatial Search for locating nearby EV charging stations.
- Request Validation to ensure data integrity and prevent invalid inputs.
- Slot Availability Management with booking conflict detection.
- Booking State Machine to enforce valid lifecycle transitions.
- Pagination and Filtering for efficient data retrieval.
- Environment-Based Configuration for secure application settings.
- Centralized Error Handling for consistent API responses.

---

## 📂 Directory Structure

```text
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # Database connection driver (Mongoose)
│   ├── middlewares/
│   │   ├── auth.middleware.js    # Authentication and role verification filters
│   │   └── validate.js           # Generic Zod parsing middleware for req body/query/params
│   ├── module/                   # Domain Modules
│   │   ├── auth/                 # User credentials & tokens module
│   │   ├── bookings/             # Booking slots management module
│   │   ├── stations/             # Charging hubs & pricing module
│   │   └── users/                # User profile and registered vehicle models
│   └── utils/
│       ├── createError.js        # Normalized error generation utility
│       ├── helpers.js            # General utility helpers & transition check maps
│       └── response.js           # Express response standardization helpers
├── index.js                      # Application main entry point
└── package.json                  # Dependencies, scripts and metadata
```

---

## 🗄️ Database Model Schemas

### User Schema
| Field | Type | Required / Index | Description |
| :--- | :--- | :---: | :--- |
| `username` | `String` | Yes | Name of the user |
| `phoneNumber`| `String` | Yes | 10-digit primary phone number |
| `email` | `String` | Yes (Unique) | Electronic mail address (lowercased) |
| `password` | `String` | Yes | Hashed password string |
| `role` | `String` | Yes | `"user"` or `"admin"`. Defaults to `"user"` |
| `vehicles` | `Array` | No | Nested subdocuments representing registered vehicles |

### Station Schema
| Field | Type | Required / Index | Description |
| :--- | :--- | :---: | :--- |
| `name` | `String` | Yes (Text Index) | Charging hub name (lowercased) |
| `address` | `String` | Yes | Detailed physical address location |
| `location` | `Object` | Yes (`2dsphere`) | GeoJSON Point with `coordinates: [longitude, latitude]` |
| `status` | `String` | Yes | `"online"` or `"offline"`. Defaults to `"online"` |
| `pricing` | `Number` | Yes | Hourly charging price |
| `chargerTypes`| `Object` | Yes | Subdocument with `charger` type (`slow`/`fast`/`superFast`) and `powerOut` |

### Booking Schema
| Field | Type | Required / Index | Description |
| :--- | :--- | :---: | :--- |
| `userId` | `ObjectId` | Yes (Ref: User) | Associated booking customer |
| `stationId` | `ObjectId` | Yes (Ref: Station) | Associated charging hub |
| `startTime` | `Date` | Yes | Charging reservation start ISO Date-time |
| `endTime` | `Date` | Yes | Charging reservation end ISO Date-time |
| `price` | `Number` | Yes | Booking reservation price paid |
| `bookingDate`| `Date` | Yes | Date when the booking transaction occurred |
| `status` | `String` | Yes | Status enum: `booked`, `arrived`, `charging`, `completed`, `cancelled` |

---

## ⚙️ Business Rules & Logic

### Booking Integrity Rules
To guarantee database integrity and prevent double-booking:
1. **Duration Restraint**: Charging slot reservations must be exactly **1 hour** (e.g. 14:00 to 15:00).
2. **Order Check**: `startTime` must precede `endTime`.
3. **Conflict Resolution**: Intersecting slots at the same station are rejected. The system checks:
   $$\text{Start}_{\text{existing}} < \text{End}_{\text{new}} \quad \text{AND} \quad \text{End}_{\text{existing}} > \text{Start}_{\text{new}}$$

### State Machine Transitions
Booking updates follow a strict, role-based status lifecycle. Below are the allowed transitions for standard Users and Administrators:

| Current Status | Allowed Next Status (User) | Allowed Next Status (Admin) | Transition Description |
| :--- | :--- | :--- | :--- |
| `booked` | `arrived`, `cancelled` | `arrived`, `charging`, `completed`, `cancelled` | Check-in or cancel reservation. Admins can directly start or complete it. |
| `arrived` | `charging`, `cancelled` | `charging`, `completed`, `cancelled` | Connect vehicle plug to start charging, or cancel. Admins can directly complete it. |
| `charging` | `completed`, `cancelled` | `completed`, `cancelled` | Complete the charging session, or perform an emergency cancellation. |
| `completed` | *None* | *None* | Final state. No further transitions allowed. |
| `cancelled` | *None* | *None* | Final state. No further transitions allowed. |

#### Lifecycle Rules
* **Creation**: All reservations are initialized as `booked`.
* **Standard Flow**: `booked` ➡️ `arrived` ➡️ `charging` ➡️ `completed`.
* **Cancellations**: A session can be updated to `cancelled` by either the user or admin from any active state (`booked`, `arrived`, or `charging`).
* **Admin Overrides**: Administrators can bypass intermediate states (e.g. going directly from `booked` to `charging` or `completed`).

---

## 🔌 API Reference

### Authentication Endpoints (`/auth`)

#### Register a New User
* **Endpoint**: `POST /auth/register`
* **Access**: Public
* **Request Headers**: `Content-Type: application/json`

<details>
<summary><b>View Request Body Schema</b></summary>

```json
{
  "username": "John Doe",           // String, min 3 chars
  "phoneNumber": "9876543210",       // String, exact 10 digits
  "email": "john@example.com",       // String, valid email format
  "password": "secretPassword123",   // String, min 6 chars
  "role": "user",                    // String, "user" | "admin" (Optional, default: "user")
  "vehicles": [                      // Array of objects (Optional)
    {
      "vehicleNo": "MH12AB1234",     // String, exact 10 characters
      "type": "4wheeler"             // String, "2wheeler" | "4wheeler"
    }
  ]
}
```
*Note: Although an array of vehicles is validated, the registration logic only extracts and registers the first vehicle object (`vehicles[0]`) from the array.*
</details>

<details>
<summary><b>View Success Response (201 Created)</b></summary>

```json
{
  "success": true,
  "message": "user created successfully",
  "data": {
    "user": {
      "_id": "648a123abc456def78901234",
      "username": "John Doe",
      "phoneNumber": "9876543210",
      "email": "john@example.com",
      "role": "user",
      "vehicles": [
        {
          "vehicleNo": "MH12AB1234",
          "type": "4wheeler"
        }
      ],
      "createdAt": "2026-06-09T08:00:00.000Z",
      "updatedAt": "2026-06-09T08:00:00.000Z",
      "__v": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
</details>

#### Log In User
* **Endpoint**: `POST /auth/login`
* **Access**: Public
* **Request Headers**: `Content-Type: application/json`

<details>
<summary><b>View Request Body Schema</b></summary>

```json
{
  "email": "john@example.com",       // String, valid email format
  "password": "secretPassword123"    // String, min 6 chars
}
```
</details>

<details>
<summary><b>View Success Response (200 OK)</b></summary>

```json
{
  "success": true,
  "message": "user loggedin successfully",
  "data": {
    "user": {
      "_id": "648a123abc456def78901234",
      "username": "John Doe",
      "phoneNumber": "9876543210",
      "email": "john@example.com",
      "role": "user",
      "vehicles": [
        {
          "vehicleNo": "MH12AB1234",
          "type": "4wheeler"
        }
      ],
      "createdAt": "2026-06-09T08:00:00.000Z",
      "updatedAt": "2026-06-09T08:00:00.000Z",
      "__v": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
</details>

---

### Station Endpoints (`/station`)
*All requests require the header: `Authorization: Bearer <JWT_TOKEN>`*

#### Create Charging Station
* **Endpoint**: `POST /station`
* **Access**: Admin Only
* **Request Headers**: `Content-Type: application/json`

<details>
<summary><b>View Request Body Schema</b></summary>

```json
{
  "name": "Evolts Supercharge Hub",     // String, min 3 characters
  "address": "Baner Main Road, Pune",   // String, min 5 characters
  "location": {                         // Object
    "type": "Point",                    // String, must be "Point"
    "coordinates": [73.7934, 18.5596]   // Array of two numbers [longitude, latitude]
  },
  "status": "online",                   // String, "online" | "offline"
  "pricing": 20,                        // Number, min price 1
  "chargerTypes": {                     // Object
    "charger": "superFast",             // String, "slow" | "fast" | "superFast"
    "powerOut": "180kW"                 // String (Optional)
  }
}
```
</details>

<details>
<summary><b>View Success Response (201 Created)</b></summary>

```json
{
  "success": true,
  "message": "station created successfully",
  "data": {
    "_id": "648a5678ab123cde45678901",
    "name": "evolts supercharge hub",   // Lowercased automatically in MongoDB
    "address": "Baner Main Road, Pune",
    "location": {
      "type": "Point",
      "coordinates": [73.7934, 18.5596]
    },
    "status": "online",
    "pricing": 20,
    "chargerTypes": {
      "charger": "superFast",
      "powerOut": "180kW"
    },
    "__v": 0
  }
}
```
</details>

#### Search/Get Charging Stations
* **Endpoint**: `GET /station`
* **Access**: Authenticated Users / Admins
* **Query Parameters**:
  - `name` (String, Optional) - Case-insensitive regex prefix search
  - `status` (`online` | `offline`, Optional)
  - `chargeType` (`slow` | `fast` | `superFast`, Optional)
  - `minPrice` (Number, Optional, coerced, min 0)
  - `maxPrice` (Number, Optional, coerced, min 0)
  - `page` (Number, Optional, Default: `1`)
  - `limit` (Number, Optional, Default: `10`)

<details>
<summary><b>View Success Response (200 OK)</b></summary>

```json
{
  "success": true,
  "message": "All Available Stations",
  "data": {
    "page": 1,
    "totalItems": 1,
    "totalPages": 1,
    "stations": [
      {
        "_id": "648a5678ab123cde45678901",
        "name": "evolts supercharge hub",
        "address": "Baner Main Road, Pune",
        "location": {
          "type": "Point",
          "coordinates": [73.7934, 18.5596]
        },
        "status": "online",
        "pricing": 20,
        "chargerTypes": {
          "charger": "superFast",
          "powerOut": "180kW"
        },
        "__v": 0
      }
    ]
  }
}
```
</details>

#### Get Single Charging Station Details
* **Endpoint**: `GET /station/:stationId`
* **Access**: Authenticated Users / Admins
* **URL Params**: `stationId` (MongoDB ObjectId)

<details>
<summary><b>View Success Response (200 OK)</b></summary>

```json
{
  "success": true,
  "message": "Station: evolts supercharge hub",
  "data": {
    "_id": "648a5678ab123cde45678901",
    "name": "evolts supercharge hub",
    "address": "Baner Main Road, Pune",
    "location": {
      "type": "Point",
      "coordinates": [73.7934, 18.5596]
    },
    "status": "online",
    "pricing": 20,
    "chargerTypes": {
      "charger": "superFast",
      "powerOut": "180kW"
    },
    "__v": 0
  }
}
```
</details>

#### Update Station Details
* **Endpoint**: `PUT /station/:stationId`
* **Access**: Admin Only
* **Request Headers**: `Content-Type: application/json`
* **URL Params**: `stationId` (MongoDB ObjectId)

<details>
<summary><b>View Request Body Schema (Partial Update)</b></summary>

```json
{
  "status": "offline",
  "pricing": 25
}
```
*At least one field whitelisted in the service (`name`, `address`, `location`, `status`, `pricing`, `chargerTypes`) must be present.*
</details>

<details>
<summary><b>View Success Response (200 OK)</b></summary>

```json
{
  "success": true,
  "message": "Station Updated Successfully",
  "data": {
    "_id": "648a5678ab123cde45678901",
    "name": "evolts supercharge hub",
    "address": "Baner Main Road, Pune",
    "location": {
      "type": "Point",
      "coordinates": [73.7934, 18.5596]
    },
    "status": "offline",
    "pricing": 25,
    "chargerTypes": {
      "charger": "superFast",
      "powerOut": "180kW"
    },
    "__v": 0
  }
}
```
</details>

#### Delete Charging Station
* **Endpoint**: `DELETE /station/:stationId`
* **Access**: Admin Only
* **URL Params**: `stationId` (MongoDB ObjectId)

<details>
<summary><b>View Success Response (200 OK)</b></summary>

```json
{
  "success": true,
  "message": "Station Deleted Successfully",
  "data": {
    "_id": "648a5678ab123cde45678901",
    "name": "evolts supercharge hub",
    "address": "Baner Main Road, Pune",
    "location": {
      "type": "Point",
      "coordinates": [73.7934, 18.5596]
    },
    "status": "offline",
    "pricing": 20,
    "chargerTypes": {
      "charger": "superFast",
      "powerOut": "180kW"
    },
    "__v": 0
  }
}
```
</details>

---

### Booking Endpoints (`/booking`)
*All requests require the header: `Authorization: Bearer <JWT_TOKEN>`*

#### Reserve a Slot
* **Endpoint**: `POST /booking`
* **Access**: Authenticated Users / Admins
* **Request Headers**: `Content-Type: application/json`

<details>
<summary><b>View Request Body Schema</b></summary>

```json
{
  "stationId": "648a5678ab123cde45678901",         // String, valid MongoDB ObjectId
  "date": "2026-06-10",                           // String, regex YYYY-MM-DD
  "startTime": "14:00",                           // String, regex HH:mm
  "endTime": "15:00",                             // String, regex HH:mm
  "price": 20,                                    // Number, min 0
  "status": "booked"                              // String, "booked" | "arrived" | "charging" | "completed" | "cancelled"
}
```
</details>

<details>
<summary><b>View Success Response (201 Created)</b></summary>

```json
{
  "success": true,
  "message": "Booking created Successfully",
  "data": {
    "_id": "648a9999ab123cde45678902",
    "userId": "648a123abc456def78901234",          // Extracted from JWT Claims
    "stationId": "648a5678ab123cde45678901",
    "startTime": "2026-06-10T14:00:00.000Z",       // Converted to ISO UTC Date
    "endTime": "2026-06-10T15:00:00.000Z",         // Converted to ISO UTC Date
    "price": 20,
    "bookingDate": "2026-06-09T08:15:30.000Z",     // Timestamp of creation
    "status": "booked",
    "createdAt": "2026-06-09T08:15:30.000Z",
    "updatedAt": "2026-06-09T08:15:30.000Z",
    "__v": 0
  }
}
```
</details>

#### Check Available Slots for Date
* **Endpoint**: `GET /booking/slots`
* **Access**: Authenticated Users / Admins
* **Request Headers**: `Content-Type: application/json`

<details>
<summary><b>View Request Body Schema</b></summary>

```json
{
  "stationId": "648a5678ab123cde45678901",         // String, valid MongoDB ObjectId
  "date": "2026-06-10"                            // String, regex YYYY-MM-DD
}
```
</details>

<details>
<summary><b>View Success Response (200 OK)</b></summary>

```json
{
  "success": true,
  "message": "All Available Slots",
  "data": {
    "total": 23,
    "availableSlots": [
      { "startTime": "00:00", "endTime": "01:00" },
      { "startTime": "01:00", "endTime": "02:00" },
      { "startTime": "02:00", "endTime": "03:00" },
      { "startTime": "03:00", "endTime": "04:00" },
      { "startTime": "04:00", "endTime": "05:00" },
      { "startTime": "05:00", "endTime": "06:00" },
      { "startTime": "06:00", "endTime": "07:00" },
      { "startTime": "07:00", "endTime": "08:00" },
      { "startTime": "08:00", "endTime": "09:00" },
      { "startTime": "09:00", "endTime": "10:00" },
      { "startTime": "10:00", "endTime": "11:00" },
      { "startTime": "11:00", "endTime": "12:00" },
      { "startTime": "12:00", "endTime": "13:00" },
      { "startTime": "13:00", "endTime": "14:00" },
      { "startTime": "15:00", "endTime": "16:00" },
      { "startTime": "16:00", "endTime": "17:00" },
      { "startTime": "17:00", "endTime": "18:00" },
      { "startTime": "18:00", "endTime": "19:00" },
      { "startTime": "19:00", "endTime": "20:00" },
      { "startTime": "20:00", "endTime": "21:00" },
      { "startTime": "21:00", "endTime": "22:00" },
      { "startTime": "22:00", "endTime": "23:00" },
      { "startTime": "23:00", "endTime": "24:00" }
    ]
  }
}
```
*Notice that `14:00 - 15:00` is automatically omitted since it was booked in the previous step.*
</details>

#### Fetch All Bookings
* **Endpoint**: `GET /booking`
* **Access**: Authenticated Users / Admins
* **Query Parameters**:
  - `stationId` (String, Optional)
  - `userId` (String, Optional) - Checked for admin role; non-admins are forced to their own JWT claims ID.
  - `status` (`booked` | `arrived` | `charging` | `completed` | `cancelled`, Optional)
  - `page` (Number, Default: `1`)
  - `limit` (Number, Default: `10`)

<details>
<summary><b>View Success Response (200 OK)</b></summary>

```json
{
  "success": true,
  "message": "All Bookings List",
  "data": {
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1,
    "bookings": [
      {
        "_id": "648a9999ab123cde45678902",
        "userId": "648a123abc456def78901234",
        "stationId": "648a5678ab123cde45678901",
        "startTime": "2026-06-10T14:00:00.000Z",
        "endTime": "2026-06-10T15:00:00.000Z",
        "price": 20,
        "bookingDate": "2026-06-09T08:15:30.000Z",
        "status": "booked",
        "createdAt": "2026-06-09T08:15:30.000Z",
        "updatedAt": "2026-06-09T08:15:30.000Z",
        "__v": 0
      }
    ]
  }
}
```
</details>

#### Fetch Single Booking Details
* **Endpoint**: `GET /booking/:bookingId`
* **Access**: Owner User or Admin
* **URL Params**: `bookingId` (MongoDB ObjectId)

<details>
<summary><b>View Success Response (200 OK)</b></summary>

```json
{
  "success": true,
  "message": "Booking Id: 648a9999ab123cde45678902",
  "data": {
    "_id": "648a9999ab123cde45678902",
    "userId": "648a123abc456def78901234",
    "stationId": "648a5678ab123cde45678901",
    "startTime": "2026-06-10T14:00:00.000Z",
    "endTime": "2026-06-10T15:00:00.000Z",
    "price": 20,
    "bookingDate": "2026-06-09T08:15:30.000Z",
    "status": "booked",
    "createdAt": "2026-06-09T08:15:30.000Z",
    "updatedAt": "2026-06-09T08:15:30.000Z",
    "__v": 0
  }
}
```
</details>

#### Patch Booking Status
* **Endpoint**: `PATCH /booking/:bookingId`
* **Access**: Owner User or Admin
* **Query Parameters**:
  - `status` (Required, e.g. `?status=arrived`)
* **Transition Checks**: Enforces the State Machine rules before committing changes to MongoDB.

<details>
<summary><b>View Success Response (200 OK)</b></summary>

```json
{
  "success": true,
  "message": "Booking Updated Successfully",
  "data": {
    "_id": "648a9999ab123cde45678902",
    "userId": "648a123abc456def78901234",
    "stationId": "648a5678ab123cde45678901",
    "startTime": "2026-06-10T14:00:00.000Z",
    "endTime": "2026-06-10T15:00:00.000Z",
    "price": 20,
    "bookingDate": "2026-06-09T08:15:30.000Z",
    "status": "arrived",
    "createdAt": "2026-06-09T08:15:30.000Z",
    "updatedAt": "2026-06-09T14:05:00.000Z",
    "__v": 0
  }
}
```
</details>

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0+)
- MongoDB Atlas account or local database instance

### Environment Configuration
Create an `.env` file in the project's root folder:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/evolts_db
JWT_SECRET=your_jwt_signature_secret_key_here
```

### Installation & Execution
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run in Development Mode:
   ```bash
   npm run dev
   ```
3. Run in Production Mode:
   ```bash
   node index.js
   ```
   
---

*Developed by the Evolts Team.*
