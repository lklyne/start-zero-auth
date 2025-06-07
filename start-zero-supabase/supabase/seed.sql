-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: Schema creation is handled by Drizzle migrations
-- This seed file provides sample data to demonstrate functionality

-- Sample users data
INSERT INTO users (id, email, name) VALUES
  ('user_1', 'alice@example.com', 'Alice Johnson'),
  ('user_2', 'bob@example.com', 'Bob Smith'),
  ('user_3', 'charlie@example.com', 'Charlie Brown')
ON CONFLICT (id) DO NOTHING;

-- Sample persons data  
INSERT INTO persons (id, name, email) VALUES
  ('person_1', 'John Doe', 'john.doe@example.com'),
  ('person_2', 'Jane Smith', 'jane.smith@example.com'), 
  ('person_3', 'Mike Wilson', 'mike.wilson@example.com'),
  ('person_4', 'Sarah Davis', 'sarah.davis@example.com'),
  ('person_5', 'Tom Johnson', 'tom.johnson@example.com')
ON CONFLICT (id) DO NOTHING;