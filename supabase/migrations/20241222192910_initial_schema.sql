-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority INTEGER DEFAULT 1,
    due_date TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT status_values CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create task_tags junction table
CREATE TABLE IF NOT EXISTS task_tags (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (task_id, tag_id)
);

-- Create RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for tasks
CREATE POLICY "Tasks are viewable by assigned users and creators"
    ON tasks FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id = created_by
            UNION
            SELECT user_id FROM profiles WHERE id = assigned_to
        )
    );

CREATE POLICY "Users can insert tasks"
    ON tasks FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id = created_by
        )
    );

CREATE POLICY "Task creators and assignees can update"
    ON tasks FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id = created_by
            UNION
            SELECT user_id FROM profiles WHERE id = assigned_to
        )
    );

-- Create policies for comments
CREATE POLICY "Comments are viewable by task participants"
    ON comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = comments.task_id
            AND (
                tasks.created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
                OR tasks.assigned_to IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            )
        )
    );

CREATE POLICY "Users can insert comments on accessible tasks"
    ON comments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_id
            AND (
                tasks.created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
                OR tasks.assigned_to IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            )
        )
    );

-- Create policies for tags
CREATE POLICY "Tags are viewable by everyone"
    ON tags FOR SELECT
    USING (true);

CREATE POLICY "Only authenticated users can create tags"
    ON tags FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create policies for task_tags
CREATE POLICY "Task tags are viewable by task participants"
    ON task_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_id
            AND (
                tasks.created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
                OR tasks.assigned_to IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            )
        )
    );

CREATE POLICY "Task creators can manage tags"
    ON task_tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_id
            AND tasks.created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- Create functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 