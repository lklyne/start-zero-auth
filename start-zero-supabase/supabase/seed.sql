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
INSERT INTO persons (id, name) VALUES
  ('person_1', 'John Doe'),
  ('person_2', 'Jane Smith'), 
  ('person_3', 'Mike Wilson'),
  ('person_4', 'Sarah Davis'),
  ('person_5', 'Tom Johnson')
ON CONFLICT (id) DO NOTHING;