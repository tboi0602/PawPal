# Reporting Service - Quick Start Guide

## 🚀 Getting Started

### Prerequisites

- All microservices running:
  - Shopping Service (Port 5001)
  - Solutions Service (Port 5002)
  - Users Service (Port 5003)
  - Reporting Service (Port 5008)
- MongoDB running
- Node.js environment configured

### Environment Setup

```env
# .env file in reporting service directory
MONGO_URI=mongodb://localhost:27017/pawpal
PORT=5008
SHOPPING_TARGET=http://localhost:5001
SOLUTIONS_TARGET=http://localhost:5002
USER_TARGET=http://localhost:5003
```

### Start Reporting Service

```bash
npm install
node server.js
```

## 📊 Quick API Testing

### 1. Generate Report Now (Test)

```bash
curl -X POST http://localhost:5008/api/reports/generate \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin" \
  -H "x-user-role: admin" \
  -H "x-user-activate: true"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Daily report generated successfully",
  "report": {
    "reportDate": "2024-01-15",
    "totalRevenue": 8600000,
    "totalProfit": 1720000,
    "totalOrders": 15,
    "totalBookings": 12,
    "newUsers": 5,
    ...
  }
}
```

### 2. Get Today's Report

```bash
curl "http://localhost:5008/api/reports?date=2024-01-15"
```

### 3. Get This Week's Report

```bash
curl "http://localhost:5008/api/reports/range?startDate=2024-01-08&endDate=2024-01-15"
```

### 4. Get Dashboard (Last 7 Days)

```bash
curl "http://localhost:5008/api/reports/dashboard" \
  -H "x-user-id: admin" \
  -H "x-user-role: admin" \
  -H "x-user-activate: true"
```

### 5. Get All Reports (Paginated)

```bash
curl "http://localhost:5008/api/reports/all?page=1&limit=10"
```

### 6. Get Monthly Report

```bash
curl "http://localhost:5008/api/reports/monthly?year=2024&month=01"
```

### 7. Get Quarterly Report

```bash
curl "http://localhost:5008/api/reports/quarterly?year=2024&quarter=1"
```

### 8. Get Yearly Report

```bash
curl "http://localhost:5008/api/reports/yearly?year=2024"
```

## 📈 How It Works

### Data Flow

```
1. generateDailyReport() called (manually or via cron)
   ↓
2. Fetch Orders from Shopping Service
   - Gets all completed orders
   - Filters by date range
   - Sums quantities and amounts
   ↓
3. Fetch Bookings from Solutions Service
   - Gets all confirmed bookings
   - Filters by date range
   - Sums booking amounts
   ↓
4. Fetch Users from Users Service
   - Gets all users
   - Counts new users by date
   ↓
5. Calculate Metrics
   - Total revenue = products + services
   - Total profit = revenue × 0.2 (20%)
   - Top products/services (top 10)
   ↓
6. Save to MongoDB Report Collection
   ↓
7. Return aggregated data to client
```

## 📋 Report Data Structure

```javascript
{
  reportDate: "2024-01-15",

  // From Shopping Service
  totalQuantity: 45,              // Items sold
  totalAmountProducts: 5000000,   // Revenue in VND

  // From Solutions Service
  usageCount: 12,                 // Bookings made
  totalAmountServices: 3600000,   // Service revenue

  // Calculated
  totalRevenue: 8600000,          // Total
  totalProfit: 1720000,           // 20% of revenue

  // From Users Service
  totalUsers: 250,                // Total users
  newUsers: 5,                    // New today
  totalOrders: 15,                // Total orders

  // Top Items
  topProducts: [
    { name: "Dog Food", quantity: 25 },
    { name: "Cat Toys", quantity: 20 }
  ],
  topServices: [
    { name: "Grooming", quantity: 8 },
    { name: "Training", quantity: 4 }
  ]
}
```

## 🔧 Development & Testing

### Clear All Reports

```bash
curl -X DELETE http://localhost:5008/api/reports/clear-all
```

### Check Service Status

The service includes logging. Check console output for:

```
Orders data: ✓          # Shopping Service OK
Bookings data: ✓        # Solutions Service OK
Users data: ✓           # Users Service OK
```

### Verify Data Integration

**Step 1:** Create test data in Shopping Service (products/orders)

**Step 2:** Create test data in Solutions Service (bookings)

**Step 3:** Verify users exist in Users Service

**Step 4:** Call generate endpoint:

```bash
POST /api/reports/generate
```

**Step 5:** Verify report created:

```bash
GET /api/reports?date=TODAY
```

## 📝 Common Tasks

### Daily Workflow

1. **Morning Dashboard Check**

   ```bash
   GET /api/reports/dashboard
   ```

   Shows last 7 days summary

2. **Specific Date Report**

   ```bash
   GET /api/reports?date=2024-01-15
   ```

3. **Week Analysis**
   ```bash
   GET /api/reports/range?startDate=2024-01-08&endDate=2024-01-14
   ```

### Weekly Workflow

1. Get weekly report
2. Analyze top products and services
3. Check new user registration

### Monthly Workflow

1. Get monthly report
   ```bash
   GET /api/reports/monthly?year=2024&month=01
   ```
2. Compare with previous months
3. Identify trends

### Quarterly Workflow

1. Get quarterly report
   ```bash
   GET /api/reports/quarterly?year=2024&quarter=1
   ```
2. Performance analysis
3. Growth metrics

### Annual Workflow

1. Get yearly report
   ```bash
   GET /api/reports/yearly?year=2024
   ```
2. Year-over-year comparison
3. Strategic planning

## 🐛 Troubleshooting

### Issue: No data in report

**Check:**

1. Are all services running?
2. Do completed orders exist?
3. Do confirmed bookings exist?
4. Are users registered?

**Solution:**

1. Verify service URLs in `.env`
2. Create test data in dependent services
3. Call `POST /api/reports/generate` again

### Issue: Service connection failed

**Check:**

```
Orders data: ✗
Bookings data: ✗
Users data: ✗
```

**Solution:**

1. Verify services running on correct ports
2. Check network connectivity
3. Verify `SHOPPING_TARGET`, `SOLUTIONS_TARGET`, `USER_TARGET` in `.env`

### Issue: Report not found

**Solution:**

1. Generate report: `POST /api/reports/generate`
2. Check date format (YYYY-MM-DD)
3. Verify date exists in database

## 📱 Postman Collection

Import this to Postman:

```json
{
  "info": { "name": "PawPal Reporting API" },
  "item": [
    {
      "name": "Generate Daily Report",
      "request": {
        "method": "POST",
        "url": "http://localhost:5008/api/reports/generate"
      }
    },
    {
      "name": "Get Report by Date",
      "request": {
        "method": "GET",
        "url": "http://localhost:5008/api/reports?date=2024-01-15"
      }
    },
    {
      "name": "Get Dashboard",
      "request": {
        "method": "GET",
        "url": "http://localhost:5008/api/reports/dashboard"
      }
    }
  ]
}
```

## 🎯 Next Steps

1. **Integrate with Frontend Dashboard**

   - Use `/api/reports/dashboard` for quick stats
   - Use `/api/reports/range` for period analysis

2. **Setup Automated Reports**

   - Cron job runs at 2 AM UTC
   - Check logs to verify execution

3. **Monitor Reports**

   - Watch for service failures
   - Track data quality
   - Monitor query performance

4. **Optimize Queries**
   - Add date indexes in MongoDB
   - Consider caching for frequently accessed reports
   - Implement report pagination

## 📚 Additional Resources

- Full API Documentation: See `REPORTING_API.md`
- Implementation Details: See `IMPLEMENTATION_SUMMARY.md`
- Report Schema: See `models/Report.js`

## ✅ Validation Checklist

- [ ] All services running on correct ports
- [ ] MongoDB connected
- [ ] Environment variables set
- [ ] Can generate report successfully
- [ ] Dashboard loads correctly
- [ ] All API endpoints responding
- [ ] Reports saved to database
- [ ] Cron job scheduled
- [ ] Error handling working
- [ ] Authentication headers included
