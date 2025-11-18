# PawPal Reporting Service - API Documentation

## Overview

The Reporting Service aggregates data from multiple microservices (Shopping, Solutions, Users) to generate comprehensive business reports. It collects data about orders, bookings, and users to provide insights into revenue, profits, and business trends.

## Architecture

### Data Flow

```
Reporting Service
    ↓
├─→ Shopping Service (Orders)
├─→ Solutions Service (Bookings)
└─→ Users Service (Users)
```

### Service Integration

All inter-service calls include authentication headers:

- `x-user-id`: User ID
- `x-user-role`: User role (admin, user, etc.)
- `x-user-activate`: Activation status

## API Endpoints

### 1. Generate Daily Report (Manual)

**Endpoint:** `POST /api/reports/generate`

**Description:** Manually trigger daily report generation by aggregating data from all services.

**Request:**

```bash
curl -X POST http://localhost:5008/api/reports/generate \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin" \
  -H "x-user-role: admin" \
  -H "x-user-activate: true"
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Daily report generated successfully",
  "report": {
    "_id": "...",
    "reportDate": "2024-01-15T00:00:00.000Z",
    "totalQuantity": 45,
    "totalAmountProducts": 5000000,
    "usageCount": 12,
    "totalAmountServices": 3600000,
    "totalRevenue": 8600000,
    "totalProfit": 1720000,
    "totalUsers": 250,
    "totalOrders": 15,
    "newUsers": 5,
    "topProducts": [
      { "name": "Dog Food Premium", "quantity": 25 },
      { "name": "Cat Toys", "quantity": 20 }
    ],
    "topServices": [
      { "name": "Grooming", "quantity": 8 },
      { "name": "Training", "quantity": 4 }
    ]
  },
  "summary": {
    "date": "2024-01-15",
    "totalRevenue": 8600000,
    "totalProfit": 1720000,
    "totalOrders": 15,
    "totalBookings": 12,
    "newUsers": 5,
    "totalUsers": 250
  }
}
```

### 2. Get Report by Date

**Endpoint:** `GET /api/reports?date=YYYY-MM-DD`

**Description:** Retrieve a specific day's report.

**Query Parameters:**

- `date` (required): Report date in YYYY-MM-DD format

**Example:**

```bash
curl "http://localhost:5008/api/reports?date=2024-01-15"
```

**Response:**

```json
{
  "_id": "...",
  "reportDate": "2024-01-15T00:00:00.000Z",
  "totalQuantity": 45,
  "totalAmountProducts": 5000000,
  "usageCount": 12,
  "totalAmountServices": 3600000,
  "totalRevenue": 8600000,
  "totalProfit": 1720000,
  "totalUsers": 250,
  "totalOrders": 15,
  "newUsers": 5,
  "topProducts": [...],
  "topServices": [...]
}
```

### 3. Get Report by Date Range (Week/Custom)

**Endpoint:** `GET /api/reports/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Description:** Retrieve aggregated report for a date range (week, month, etc.).

**Query Parameters:**

- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format

**Example:**

```bash
curl "http://localhost:5008/api/reports/range?startDate=2024-01-01&endDate=2024-01-07"
```

**Response:**

```json
{
  "success": true,
  "startDate": "2024-01-01",
  "endDate": "2024-01-07",
  "totalQuantity": 280,
  "totalAmountProducts": 35000000,
  "usageCount": 82,
  "totalAmountServices": 25200000,
  "totalRevenue": 60200000,
  "totalProfit": 12040000,
  "totalUsers": 250,
  "totalOrders": 105,
  "newUsers": 28,
  "topProducts": [...],
  "topServices": [...]
}
```

### 4. Get Monthly Report

**Endpoint:** `GET /api/reports/monthly?year=YYYY&month=MM`

**Description:** Retrieve aggregated report for a specific month.

**Query Parameters:**

- `year` (required): Year in YYYY format
- `month` (required): Month in MM format (01-12)

**Example:**

```bash
curl "http://localhost:5008/api/reports/monthly?year=2024&month=01"
```

### 5. Get Quarterly Report

**Endpoint:** `GET /api/reports/quarterly?year=YYYY&quarter=Q`

**Description:** Retrieve aggregated report for a specific quarter.

**Query Parameters:**

- `year` (required): Year in YYYY format
- `quarter` (required): Quarter (1, 2, 3, or 4)

**Example:**

```bash
curl "http://localhost:5008/api/reports/quarterly?year=2024&quarter=1"
```

### 6. Get Yearly Report

**Endpoint:** `GET /api/reports/yearly?year=YYYY`

**Description:** Retrieve aggregated report for a specific year.

**Query Parameters:**

- `year` (required): Year in YYYY format

**Example:**

```bash
curl "http://localhost:5008/api/reports/yearly?year=2024"
```

### 7. Get All Reports (Paginated)

**Endpoint:** `GET /api/reports/all?page=1&limit=10`

**Description:** Retrieve all reports with pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**

```bash
curl "http://localhost:5008/api/reports/all?page=1&limit=20"
```

**Response:**

```json
{
  "success": true,
  "pagination": {
    "total": 365,
    "page": 1,
    "limit": 20,
    "totalPages": 19
  },
  "reports": [...]
}
```

### 8. Get Dashboard Summary (Last 7 Days)

**Endpoint:** `GET /api/reports/dashboard`

**Description:** Get a quick summary of the last 7 days of reports for dashboard display.

**Example:**

```bash
curl "http://localhost:5008/api/reports/dashboard" \
  -H "x-user-id: admin" \
  -H "x-user-role: admin" \
  -H "x-user-activate: true"
```

**Response:**

```json
{
  "success": true,
  "summary": {
    "totalRevenue7Days": 60200000,
    "totalProfit7Days": 12040000,
    "totalOrders7Days": 105,
    "totalBookings7Days": 82,
    "newUsers7Days": 28,
    "latestReport": {
      "reportDate": "2024-01-15T00:00:00.000Z",
      "totalRevenue": 8600000,
      "totalOrders": 15,
      ...
    }
  },
  "recentReports": [...]
}
```

## Report Schema

```javascript
{
  _id: ObjectId,
  reportDate: Date,

  // Product Sales Data
  totalQuantity: Number,              // Total items sold
  totalAmountProducts: Number,        // Total revenue from products

  // Service Booking Data
  usageCount: Number,                 // Number of bookings
  totalAmountServices: Number,        // Total revenue from services

  // Financial Summary
  totalRevenue: Number,               // totalAmountProducts + totalAmountServices
  totalProfit: Number,                // totalRevenue * 0.2 (20% margin)

  // User Analytics
  totalUsers: Number,                 // Total active users
  totalOrders: Number,                // Total orders placed
  newUsers: Number,                   // New users registered

  // Top Items
  topProducts: [                      // Top 10 products by quantity
    { name: String, quantity: Number }
  ],
  topServices: [                      // Top 10 services by usage
    { name: String, quantity: Number }
  ],

  createdAt: Date,
  updatedAt: Date
}
```

## Data Aggregation Logic

### Order Processing

1. Fetches completed orders from Shopping Service
2. Filters orders for the target date range
3. Sums up item quantities and amounts
4. Tracks top products by quantity sold

### Booking Processing

1. Fetches confirmed bookings from Solutions Service
2. Filters bookings for the target date range
3. Sums up booking amounts
4. Tracks top services by booking count

### User Processing

1. Fetches all users from Users Service
2. Counts total active users
3. Identifies new users registered on the date
4. Updates user statistics

## Scheduling

### Automatic Report Generation

- **Frequency:** Daily at 2:00 AM UTC
- **Job:** Cron job runs automatically via Node-cron
- **Backfill:** Test function generates reports for previous 30 days on startup

### Manual Triggering

You can manually generate reports by:

```bash
POST /api/reports/generate
```

## Error Handling

### Common Error Responses

**404 - Report Not Found**

```json
{
  "success": false,
  "message": "Report not found for this date"
}
```

**400 - Missing Parameters**

```json
{
  "success": false,
  "message": "Please provide date (YYYY-MM-DD format)"
}
```

**500 - Server Error**

```json
{
  "success": false,
  "message": "Error generating report",
  "error": "Error message details"
}
```

## Inter-Service Communication

### Authentication Headers

All requests to other services include:

```javascript
{
  "Content-Type": "application/json",
  "x-user-id": "admin",
  "x-user-role": "admin",
  "x-user-activate": "true"
}
```

### Fallback Handling

If any service is unavailable:

- The function logs the error
- Report generation continues with available data
- Missing service data is marked as 0

## Performance Optimization

1. **Aggregation Pipeline:** Uses MongoDB aggregation for efficient grouping
2. **Date Filtering:** Pre-filters data at service level
3. **Top Items:** Only keeps top 10 items to reduce data size
4. **Caching:** Reports are generated once per day

## Testing

### Clear All Reports

```bash
DELETE /api/reports/clear-all
```

### Generate Test Data

The scheduler automatically generates 30 days of test data on startup for development and testing.

## Example Usage Scenarios

### Daily Dashboard

```bash
# Get last 7 days summary
curl "http://localhost:5008/api/reports/dashboard"
```

### Weekly Review

```bash
# Get last 7 days detailed report
curl "http://localhost:5008/api/reports/range?startDate=2024-01-08&endDate=2024-01-15"
```

### Monthly Analysis

```bash
# Get January 2024 report
curl "http://localhost:5008/api/reports/monthly?year=2024&month=01"
```

### Quarterly Performance

```bash
# Get Q1 2024 report
curl "http://localhost:5008/api/reports/quarterly?year=2024&quarter=1"
```

### Annual Summary

```bash
# Get 2024 report
curl "http://localhost:5008/api/reports/yearly?year=2024"
```

## Configuration

Ensure the following environment variables are set in `.env`:

```
SHOPPING_TARGET=http://localhost:5001
SOLUTIONS_TARGET=http://localhost:5002
USER_TARGET=http://localhost:5003
MONGO_URI=mongodb://localhost:27017/pawpal
PORT=5008
```
