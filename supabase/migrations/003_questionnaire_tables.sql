-- Questionnaire Responses
CREATE TABLE questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own questionnaire responses" 
ON questionnaire_responses FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR is_superadmin(auth.uid()));

CREATE POLICY "Users can insert own questionnaire responses" 
ON questionnaire_responses FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id OR is_superadmin(auth.uid()));
