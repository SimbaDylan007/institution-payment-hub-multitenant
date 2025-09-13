
# Payment Service Backend

This is a Spring Boot backend service that connects to the ZB Bank API for payment alerts and stores data in a local MySQL database.

## Prerequisites

1. Java 11 or higher
2. Maven
3. MySQL Server running on localhost:3306

## Database Setup

1. Create a MySQL database named `payment_db`:

```sql
CREATE DATABASE payment_db;
```

2. Make sure the MySQL server is running on localhost:3306 with the username "root" and no password (or update the application.properties file with your credentials).

## Running the Application

1. Navigate to the `backend` directory
2. Build the application:

```bash
mvn clean install
```

3. Run the application:

```bash
mvn spring-boot:run
```

The application will run on http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com

## API Endpoints

- **POST /api/payments/pick-all-pending**: Pick all pending payments from ZB Bank API
- **POST /api/payments/all-payments**: Get all payments from ZB Bank API
- **GET /api/payments/reset/{id}**: Reset a payment status to pending
- **GET /api/payments/local**: Get all payments from local database
- **GET /api/payments/{id}**: Get a specific payment by ID
- **GET /api/payments/status/{status}**: Get payments by status

## Request Body Example

```json
{
  "institutionId": "your_institution_id",
  "password": "your_password"
}
```

## Testing

You can use tools like Postman or cURL to test the API endpoints.

Example cURL command:

```bash
curl -X POST "http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/payments/all-payments" \
     -H "Content-Type: application/json" \
     -d '{"institutionId": "your_institution_id", "password": "your_password"}'
```
