-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT status_values CHECK (status IN ('pending', 'accepted', 'declined')),
    CONSTRAINT unique_participant UNIQUE (schedule_id, user_id)
);

-- Enable RLS
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Policies for schedules
CREATE POLICY "Schedules are viewable by participants"
    ON schedules FOR SELECT
    USING (
        auth.uid() IN (
            SELECT p.user_id FROM profiles p
            JOIN participants pa ON pa.user_id = p.id
            WHERE pa.schedule_id = schedules.id
        )
        OR
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id = schedules.created_by
        )
    );

CREATE POLICY "Users can create schedules"
    ON schedules FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id = created_by
        )
    );

CREATE POLICY "Schedule creators can update"
    ON schedules FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id = created_by
        )
    );

CREATE POLICY "Schedule creators can delete"
    ON schedules FOR DELETE
    USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id = created_by
        )
    );

-- Policies for participants
CREATE POLICY "Participants are viewable by schedule participants"
    ON participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM schedules s
            WHERE s.id = participants.schedule_id
            AND (
                s.created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
                OR
                EXISTS (
                    SELECT 1 FROM participants p2
                    WHERE p2.schedule_id = participants.schedule_id
                    AND p2.user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
                )
            )
        )
    );

CREATE POLICY "Schedule creators can manage participants"
    ON participants FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM schedules s
            WHERE s.id = schedule_id
            AND s.created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can update their own participation status"
    ON participants FOR UPDATE
    USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Create trigger for updated_at
CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at
    BEFORE UPDATE ON participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 