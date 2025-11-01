# Database Files

This folder contains the essential database files for the MentorFlow application.

## Files

### `schema.sql`
- **Purpose**: Database schema definition
- **Contains**: All table structures, indexes, triggers, and constraints
- **Usage**: Run this to create the database structure from scratch

### `mentor-student-assignments.csv`
- **Purpose**: Source data file with real student and mentor assignments
- **Contains**: 23 mentors and 214 students with their assignments
- **Status**: ✅ **Data has been imported into the database**

## Database Status

✅ **PostgreSQL Database**: `mentorflow`  
✅ **Schema**: Created and ready  
✅ **Real Data**: 23 mentors, 214 students, 214 relationships imported  
✅ **Backend API**: Connected and running on port 5001  

## Quick Commands

```bash
# Connect to database
psql -d mentorflow

# Recreate database (if needed)
psql -d mentorflow -f schema.sql

# Check data
psql -d mentorflow -c "SELECT COUNT(*) FROM users WHERE user_type = 'mentor';"
psql -d mentorflow -c "SELECT COUNT(*) FROM users WHERE user_type = 'mentee';"
```

## Data Summary

- **Mentors**: 23 (from MUJ faculty)
- **Students**: 214 (from MUJ with real registration numbers)
- **Sections**: A, B, C, D
- **Batches**: BATCH-1, BATCH-2
- **Relationships**: All properly assigned and active
