-- Supabase 数据库设置

-- 创建成长日志表
CREATE TABLE growth_logs (
  id BIGINT PRIMARY KEY,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  height TEXT DEFAULT '',
  weight TEXT DEFAULT '',
  content TEXT DEFAULT '',
  photos JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 创建索引
CREATE INDEX idx_growth_logs_date ON growth_logs(date);
CREATE INDEX idx_growth_logs_category ON growth_logs(category);

-- 启用行级安全策略
ALTER TABLE growth_logs ENABLE ROW LEVEL SECURITY;

-- 创建策略（允许所有操作）
CREATE POLICY "Allow all operations" ON growth_logs
  FOR ALL USING (true);

-- 插入示例数据
INSERT INTO growth_logs (id, date, title, category, content, height, weight, photos, tags)
VALUES
  (
    1, 
    '2024-01-01', 
    '第一次翻身', 
    'milestone', 
    '今天宝宝第一次自己翻身了！虽然有点吃力，但是成功翻过去了，太棒了！爸爸妈妈都为你骄傲。', 
    '', 
    '', 
    '[]', 
    '["第一次", "翻身", "里程碑"]'
  ),
  (
    2, 
    '2024-02-01', 
    '三个月体检', 
    'growth', 
    '今天去做了三个月体检，医生说宝宝发育得很好，各项指标都在正常范围内。', 
    '62.5', 
    '6.8', 
    '[]', 
    '["体检", "健康"]'
  ),
  (
    3, 
    '2024-03-01', 
    '第一次去公园', 
    'daily', 
    '今天天气很好，带宝宝去公园散步。宝宝对周围的一切都充满了好奇，眼睛一直转来转去的。', 
    '', 
    '', 
    '[]', 
    '["户外", "公园"]'
  );
