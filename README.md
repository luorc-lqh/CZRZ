# 儿童成长日志网页

一个温馨可爱的儿童成长日志网页，支持云端数据存储，可部署到GitHub Pages在线使用。

## 功能特点

- 🎨 温馨可爱的界面设计
- 📝 成长日志记录（支持里程碑、日常、照片、成长数据等分类）
- 📸 照片上传和管理
- 📊 数据统计（日志数量、照片数量、记录天数）
- 🔄 云端数据存储（使用Supabase）
- 📱 响应式设计，支持手机和电脑
- 🌐 可部署到GitHub Pages在线使用

## 快速开始

### 1. 设置Supabase

1. **创建Supabase账户**
   - 访问 [Supabase](https://supabase.com/) 并创建免费账户
   - 创建一个新的项目

2. **获取项目凭据**
   - 在项目设置中找到 `Project URL` 和 `Anon Key`
   - 更新 `script.js` 文件中的以下配置：
   ```javascript
   const supabaseUrl = 'YOUR_PROJECT_URL';
   const supabaseKey = 'YOUR_ANON_KEY';
   ```

3. **创建数据库表**
   - 在Supabase控制台中打开SQL编辑器
   - 复制并执行 `SUPABASE_SETUP.sql` 文件中的SQL语句
   - 这将创建 `growth_logs` 表并插入示例数据

### 2. 本地运行

```bash
# 方法1：使用Python启动本地服务器
python -m http.server 8080

# 方法2：使用Node.js启动本地服务器（需要安装http-server）
npm install -g http-server
http-server -p 8080
```

然后在浏览器中访问：`http://localhost:8080`

### 3. 部署到GitHub Pages

1. **创建GitHub仓库**
   - 在GitHub上创建一个新的仓库
   - 克隆仓库到本地

2. **上传文件**
   - 将所有文件（index.html, style.css, script.js）上传到仓库
   - 也可以上传 SUPABASE_SETUP.sql 和 README.md 作为参考

3. **启用GitHub Pages**
   - 在仓库设置中找到 "Pages"
   - 选择 "main" 分支作为源
   - 保存设置
   - 等待几分钟，GitHub Pages会自动部署你的网站

4. **访问在线网站**
   - GitHub Pages会提供一个URL，如：`https://yourusername.github.io/repository-name`
   - 访问这个URL即可使用在线版本

## 项目结构

```
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # JavaScript逻辑
├── SUPABASE_SETUP.sql  # Supabase数据库设置
└── README.md           # 项目说明
```

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **数据存储**：Supabase (PostgreSQL)
- **部署**：GitHub Pages

## 注意事项

1. **Supabase配置**
   - 请确保在 `script.js` 中正确配置了 `supabaseUrl` 和 `supabaseKey`
   - 这些凭据是公开的，因此建议在生产环境中使用更安全的认证方式

2. **照片存储**
   - 目前照片以Base64格式存储在数据库中
   - 对于大量照片，建议使用Supabase Storage服务

3. **数据安全**
   - 当前配置允许任何人访问和修改数据
   - 如需更高级的安全控制，请参考Supabase文档设置认证和授权

4. **GitHub Pages**
   - 部署可能需要几分钟时间生效
   - 确保仓库是公开的（免费GitHub Pages只支持公开仓库）

## 故障排除

### 无法连接到Supabase
- 检查网络连接
- 确认Supabase项目是否处于活跃状态
- 验证 `supabaseUrl` 和 `supabaseKey` 是否正确

### 数据不保存
- 检查浏览器控制台是否有错误信息
- 确认Supabase数据库表是否正确创建
- 验证行级安全策略是否正确设置

### GitHub Pages部署失败
- 检查仓库设置是否正确
- 确认文件是否正确上传
- 查看GitHub Actions日志了解详细错误

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 许可证

MIT License
