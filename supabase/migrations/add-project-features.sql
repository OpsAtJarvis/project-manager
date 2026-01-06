-- Add new columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL;

-- Create project_notes table
CREATE TABLE IF NOT EXISTS project_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_user_id ON project_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_to ON projects(assigned_to);

-- Add trigger for notes updated_at
CREATE TRIGGER update_project_notes_updated_at BEFORE UPDATE ON project_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
