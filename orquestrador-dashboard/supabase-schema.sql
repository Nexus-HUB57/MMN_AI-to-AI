-- =============================================
-- ORQUESTRADOR DATABASE SCHEMA
-- Nexus-HUB57 MMN AI-to-AI Platform
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- AGENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('afiliado', 'preditivo', 'generativo', 'orquestrador', 'agente_ca')),
    status VARCHAR(20) NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'busy', 'offline')),
    capabilities TEXT[] DEFAULT '{}',
    metrics JSONB DEFAULT '{"tasksCompleted": 0, "tasksFailed": 0, "avgResponseTime": 0, "lastActive": null}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for agent type and status queries
CREATE INDEX idx_agents_type_status ON agents(type, status);

-- =============================================
-- TASKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('affiliate_management', 'predictive_analysis', 'content_generation', 'agent_orchestration', 'autonomous_execution')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    data JSONB DEFAULT '{}',
    result JSONB,
    error TEXT,
    assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for task status queries
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_assigned_agent ON tasks(assigned_agent_id);

-- =============================================
-- AFFILIATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    tier VARCHAR(20) NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    metrics JSONB DEFAULT '{"totalSales": 0, "totalCommission": 0, "conversionRate": 0, "activeLinks": 0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for affiliate email lookup
CREATE INDEX idx_affiliates_email ON affiliates(email);
CREATE INDEX idx_affiliates_tier ON affiliates(tier);

-- =============================================
-- COMMISSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    commission DECIMAL(15, 2) NOT NULL,
    tier VARCHAR(20) NOT NULL,
    source VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for affiliate commission lookup
CREATE INDEX idx_commissions_affiliate ON commissions(affiliate_id);
CREATE INDEX idx_commissions_status ON commissions(status);

-- =============================================
-- PREDICTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    target VARCHAR(255) NOT NULL,
    value DECIMAL(15, 4) NOT NULL,
    confidence DECIMAL(5, 4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    timeframe VARCHAR(50) NOT NULL,
    factors TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for prediction queries
CREATE INDEX idx_predictions_target ON predictions(target);
CREATE INDEX idx_predictions_type ON predictions(type);

-- =============================================
-- GENERATED CONTENT TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS generated_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    prompt TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{"tokens": 0, "model": "", "temperature": 0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for content type queries
CREATE INDEX idx_generated_content_type ON generated_content(type);

-- =============================================
-- WORKFLOWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    steps JSONB NOT NULL DEFAULT '[]',
    triggers TEXT[] DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- EXECUTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    command VARCHAR(255) NOT NULL,
    parameters JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    steps JSONB DEFAULT '[]',
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
    result JSONB,
    error TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for execution queries
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_workflow ON executions(workflow_id);

-- =============================================
-- EVENTS TABLE (for event log)
-- =============================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL,
    data JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for event queries
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON affiliates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (adjust as needed for your auth strategy)
CREATE POLICY "Allow public read access" ON agents FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON agents FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON tasks FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON affiliates FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON affiliates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON affiliates FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON commissions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON commissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON commissions FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON predictions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON predictions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON generated_content FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON generated_content FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON workflows FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON workflows FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON workflows FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON executions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON executions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON executions FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON events FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON events FOR INSERT WITH CHECK (true);

-- =============================================
-- SEED DATA: Default Agents
-- =============================================
INSERT INTO agents (name, type, status, capabilities) VALUES
    ('Orquestrador-Master', 'orquestrador', 'idle', ARRAY['orchestration', 'coordination', 'monitoring']),
    ('Agente-Afiliado', 'afiliado', 'idle', ARRAY['affiliate_management', 'commission_processing']),
    ('Agente-Preditivo', 'preditivo', 'idle', ARRAY['prediction', 'analytics', 'trends']),
    ('Agente-Generativo', 'generativo', 'idle', ARRAY['content_generation', 'template_creation']),
    ('Agente-IA', 'agente_ca', 'idle', ARRAY['autonomous_execution', 'workflow_automation']);

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE agents IS 'AI agents in the Orquestrador system';
COMMENT ON TABLE tasks IS 'Tasks managed by the Orquestrador';
COMMENT ON TABLE affiliates IS 'Affiliate members in the MMN system';
COMMENT ON TABLE commissions IS 'Commission records for affiliates';
COMMENT ON TABLE predictions IS 'Predictions generated by the predictive module';
COMMENT ON TABLE generated_content IS 'Content generated by the generative module';
COMMENT ON TABLE workflows IS 'Automated workflows for the IA Agentica module';
COMMENT ON TABLE executions IS 'Execution records for autonomous commands';
COMMENT ON TABLE events IS 'Event log for system-wide events';