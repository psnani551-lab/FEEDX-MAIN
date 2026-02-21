# FEEDX Backend Setup

## Quick Start

### 1. Install Python Dependencies
```bash
cd server
pip install -r requirements.txt
```

### 2. Start the Attendance API
```bash
python3 attendance_api.py
```

The API will run on `http://localhost:5001`

### 3. Test the API
```bash
curl "http://localhost:5001/health"
curl "http://localhost:5001/api/attendance?pin=24054-cps-024"
```

## API Endpoints

### Health Check
- **URL**: `GET /health`
- **Response**: `{"status": "ok", "service": "SBTET Attendance API"}`

### Get Attendance
- **URL**: `GET /api/attendance`
- **Query Parameters**:
  - `pin` (required): Student PIN (format: XXXXX-XXX-XXX)
- **Response**:
```json
{
  "success": true,
  "studentInfo": {
    "Name": "Student Name",
    "Pin": "24054-cps-024",
    "Semester": "4",
    "BranchCode": "CPS",
    "Scheme": "C16",
    "Percentage": "85.50",
    "NumberOfDaysPresent": "171",
    "WorkingDays": "200",
    "AttendeeId": "12345"
  },
  "attendanceRecords": [
    {
      "SNo": 1,
      "Date": "2024-01-15T00:00:00",
      "slotname": "Morning",
      "status": "P"
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{"error": "Missing pin parameter"}
```

### 404 Not Found
```json
{"error": "Student not found. Please check the PIN."}
```

### 502 Bad Gateway
```json
{"error": "HTTP Error: ..."}
{"error": "Network error: ..."}
{"error": "Invalid JSON response: ..."}
```

### 504 Gateway Timeout
```json
{"error": "Request timeout. Please try again."}
```

## Environment Variables

- `PORT`: Server port (default: 5001)

Example:
```bash
PORT=8000 python3 attendance_api.py
```

## Troubleshooting

### CORS Issues
The API is configured with CORS enabled for all origins. If you still face CORS issues:
1. Check that the API is running
2. Verify the frontend is making requests to the correct URL
3. Check browser console for detailed error messages

### SBTET API Issues
If the SBTET API is unreachable:
1. Check your internet connection
2. Verify the SBTET portal is accessible
3. The API tries multiple endpoint formats automatically

### Invalid PIN Format
Ensure PIN follows the format: `XXXXX-XXX-XXX` (e.g., `24054-cps-024`)
