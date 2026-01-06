-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's ID from JWT
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE sql STABLE;

-- Helper function to check if user is member of organization
CREATE OR REPLACE FUNCTION is_org_member(org_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = org_uuid AND user_id = auth.user_id()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function to check if user is project member
CREATE OR REPLACE FUNCTION is_project_member(proj_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members pm
    JOIN projects p ON p.id = pm.project_id
    WHERE pm.project_id = proj_uuid
    AND (pm.user_id = auth.user_id() OR p.owner_id = auth.user_id())
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function to check if user has access to project through org membership
CREATE OR REPLACE FUNCTION has_project_access(proj_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects p
    JOIN org_members om ON om.org_id = p.org_id
    WHERE p.id = proj_uuid AND om.user_id = auth.user_id()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.user_id());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.user_id());

CREATE POLICY "Users can view profiles in their organizations"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_members om1
      JOIN org_members om2 ON om1.org_id = om2.org_id
      WHERE om1.user_id = auth.user_id() AND om2.user_id = users.id
    )
  );

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to"
  ON organizations FOR SELECT
  USING (is_org_member(id));

CREATE POLICY "Users can insert organizations"
  ON organizations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update organizations they belong to"
  ON organizations FOR UPDATE
  USING (is_org_member(id));

-- Organization members policies
CREATE POLICY "Users can view members of their organizations"
  ON org_members FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Users can insert org members"
  ON org_members FOR INSERT
  WITH CHECK (is_org_member(org_id));

CREATE POLICY "Users can delete org members from their organizations"
  ON org_members FOR DELETE
  USING (is_org_member(org_id));

-- Projects policies
CREATE POLICY "Users can view projects in their organizations"
  ON projects FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Users can insert projects in their organizations"
  ON projects FOR INSERT
  WITH CHECK (is_org_member(org_id) AND owner_id = auth.user_id());

CREATE POLICY "Users can update projects they own or are members of"
  ON projects FOR UPDATE
  USING (owner_id = auth.user_id() OR is_project_member(id));

CREATE POLICY "Project owners can delete their projects"
  ON projects FOR DELETE
  USING (owner_id = auth.user_id());

-- Project members policies
CREATE POLICY "Users can view project members if they have project access"
  ON project_members FOR SELECT
  USING (has_project_access(project_id));

CREATE POLICY "Project owners can add members"
  ON project_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND owner_id = auth.user_id()
    )
  );

CREATE POLICY "Project owners can remove members"
  ON project_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND owner_id = auth.user_id()
    )
  );

-- Documents policies
CREATE POLICY "Users can view documents in accessible projects"
  ON documents FOR SELECT
  USING (has_project_access(project_id) OR is_project_member(project_id));

CREATE POLICY "Users can insert documents in accessible projects"
  ON documents FOR INSERT
  WITH CHECK (
    (has_project_access(project_id) OR is_project_member(project_id))
    AND uploaded_by = auth.user_id()
  );

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (uploaded_by = auth.user_id() OR is_project_member(project_id));

CREATE POLICY "Users can delete their own documents or if they're project owner"
  ON documents FOR DELETE
  USING (
    uploaded_by = auth.user_id()
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND owner_id = auth.user_id()
    )
  );

-- Storage policies for project-documents bucket
CREATE POLICY "Users can upload documents to accessible projects"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-documents'
    AND auth.user_id() IS NOT NULL
  );

CREATE POLICY "Users can view documents from accessible projects"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-documents'
    AND auth.user_id() IS NOT NULL
  );

CREATE POLICY "Users can update their uploaded documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'project-documents'
    AND auth.user_id() IS NOT NULL
  );

CREATE POLICY "Users can delete their uploaded documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-documents'
    AND auth.user_id() IS NOT NULL
  );
