    # Resource Utilization Report

### Request
`GET /api/utilization?year=2025&month=8`

### Sample Response
```json
{
  "weeks": ["Aug 4 - Aug 10", "Aug 11 - Aug 17", "Aug 18 - Aug 24", "Aug 25 - Aug 31"],
  "teams": [
    {
      "category": "Software Engineer",
      "totalAvailable": 1200,
      "totalUtilized": 904,
      "utilizationRate": 75.33,
      "members": [
        {
          "name": "Adam",
          "totalAvailable": 240,
          "totalUtilized": 164,
          "utilizationRate": 68.33,
          "weekly": [41.0, 33.0, 46.0, 44.0]
        },
        {
          "name": "Alexa",
          "totalAvailable": 240,
          "totalUtilized": 180,
          "utilizationRate": 75.0,
          "weekly": [42.0, 31.0, 59.0, 48.0]
        },
        {
          "name": "Alex",
          "totalAvailable": 240,
          "totalUtilized": 190,
          "utilizationRate": 79.17,
          "weekly": [48.0, 45.0, 52.0, 45.0]
        },
        {
          "name": "Alice",
          "totalAvailable": 240,
          "totalUtilized": 200,
          "utilizationRate": 83.33,
          "weekly": [50.0, 48.0, 52.0, 50.0]
        },
        {
          "name": "Anna",
          "totalAvailable": 240,
          "totalUtilized": 170,
          "utilizationRate": 70.83,
          "weekly": [40.0, 42.0, 44.0, 44.0]
        }
      ]
    },
    {
      "category": "Data Engineer",
      "totalAvailable": 720,
      "totalUtilized": 590,
      "utilizationRate": 81.94,
      "members": [
        {
          "name": "Adrian",
          "totalAvailable": 240,
          "totalUtilized": 195,
          "utilizationRate": 81.25,
          "weekly": [48.0, 50.0, 47.0, 50.0]
        },
        {
          "name": "Andy",
          "totalAvailable": 240,
          "totalUtilized": 200,
          "utilizationRate": 83.33,
          "weekly": [52.0, 48.0, 50.0, 50.0]
        },
        {
          "name": "Arnold",
          "totalAvailable": 240,
          "totalUtilized": 195,
          "utilizationRate": 81.25,
          "weekly": [45.0, 50.0, 48.0, 52.0]
        }
      ]
    }
  ]
}
```

### Business Rules
- **Total Available Hours**: Calculated as working days × 8 hours/day (240 hours per month per member)
- **Working Days**: 5 days/week × ~4.8 weeks/month = ~24 working days/month
- **Utilization Rate**: (Total Utilized / Total Available) × 100
- **Overtime Policy**: Utilization rates > 100% indicate overtime work
- **Week Boundaries**: Monday to Sunday, partial weeks included in month calculation

### Schema
**Table: member_works**
|Column|Type|Description|
|---|---|---|
|id|SERIAL PRIMARY KEY|Unique identifier|
|member_id|INTEGER NOT NULL|Foreign key to members table|
|work_date|DATE NOT NULL|Date of work performed|
|workload|DECIMAL(5,2) NOT NULL|Hours worked on the date|
|created_at|TIMESTAMP DEFAULT NOW()|Record creation timestamp|
|updated_at|TIMESTAMP DEFAULT NOW()|Record update timestamp|

**Table: members**
|Column|Type|Description|
|---|---|---|
|id|SERIAL PRIMARY KEY|Unique identifier|
|name|VARCHAR(100) NOT NULL|Member full name|
|role|VARCHAR(50) NOT NULL|Job category/role|
|is_active|BOOLEAN DEFAULT TRUE|Active status|
|created_at|TIMESTAMP DEFAULT NOW()|Record creation timestamp|

### Sample Data
```sql
-- Sample member_works data
INSERT INTO member_works (member_id, work_date, workload) VALUES
(101, '2025-08-01', 8.00),
(101, '2025-08-02', 7.50),
(101, '2025-08-05', 6.50),
(102, '2025-08-01', 8.00),
(102, '2025-08-02', 8.00),
(102, '2025-08-05', 7.00);

-- Sample members data
INSERT INTO members (id, name, role) VALUES
(101, 'Adam', 'Software Engineer'),
(102, 'Adrian', 'Data Engineer'),
(103, 'Alexa', 'Software Engineer');
```

### Indexing
```sql
-- Composite index for common query patterns
CREATE INDEX idx_member_date ON member_works (member_id, work_date);

-- Index for date range queries
CREATE INDEX idx_work_date ON member_works (work_date);

-- Index for member lookups
CREATE INDEX idx_members_role_active ON members (role, is_active);
```

### DB Layer Query
```sql
WITH monthly_data AS (
    SELECT
        mw.member_id,
        m.name AS member_name,
        m.role AS category,
        date_trunc('week', mw.work_date)::date AS week_start,
        SUM(mw.workload) AS weekly_workload,
        -- Calculate total available hours (24 working days * 8 hours)
        240 AS total_available_hours
    FROM member_works mw
    JOIN members m ON mw.member_id = m.id
    WHERE mw.work_date >= DATE '2025-08-01' 
      AND mw.work_date < DATE '2025-09-01'
      AND m.is_active = TRUE
    GROUP BY mw.member_id, m.name, m.role, week_start
),
member_totals AS (
    SELECT 
        member_id,
        member_name,
        category,
        total_available_hours,
        SUM(weekly_workload) AS total_utilized_hours,
        ROUND((SUM(weekly_workload) / total_available_hours * 100), 2) AS utilization_rate,
        -- Aggregate weekly data as array
        array_agg(weekly_workload ORDER BY week_start) AS weekly_hours
    FROM monthly_data
    GROUP BY member_id, member_name, category, total_available_hours
)
SELECT 
    category,
    SUM(total_available_hours) AS team_total_available,
    SUM(total_utilized_hours) AS team_total_utilized,
    ROUND((SUM(total_utilized_hours) / SUM(total_available_hours) * 100), 2) AS team_utilization_rate,
    json_agg(
        json_build_object(
            'name', member_name,
            'totalAvailable', total_available_hours,
            'totalUtilized', total_utilized_hours,
            'utilizationRate', utilization_rate,
            'weekly', weekly_hours
        ) ORDER BY member_name
    ) AS members
FROM member_totals
GROUP BY category
ORDER BY category;
```

### API Implementation Notes
1. **Date Range**: Query filters data for the specified month (2025-08)
2. **Week Calculation**: Uses PostgreSQL's `date_trunc('week', date)` for Monday-based weeks
3. **Response Format**: JSON structure matches the sample response exactly
4. **Performance**: Indexed queries should handle large datasets efficiently
5. **Data Integrity**: Foreign key constraints ensure referential integrity

### Error Handling
- **Invalid Date Range**: Return 400 Bad Request for invalid year/month parameters
- **No Data Found**: Return empty arrays for teams with no work logged
- **Database Errors**: Return 500 Internal Server Error with appropriate logging