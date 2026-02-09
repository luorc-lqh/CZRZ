// 儿童成长日志 - JavaScript

// Supabase配置
const supabaseUrl = 'https://htvtubwiwgzwqqtqpuhp.supabase.co';
const supabaseKey = 'sb_publishable_6BqU8WoPUU0m4KgQwLsUtQ_dptYoRpW';

// 初始化Supabase客户端
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// 数据存储
let logs = [];
let currentFilter = 'all';
let currentLogId = null;
let tempPhotos = [];
let tempTags = [];
let isLoading = false;
let elements = {};

// 分类配置
const categoryConfig = {
    milestone: { label: '🎯 里程碑', class: 'category-milestone' },
    daily: { label: '🌟 日常', class: 'category-daily' },
    photo: { label: '📸 照片', class: 'category-photo' },
    growth: { label: '📏 成长数据', class: 'category-growth' },
    other: { label: '💝 其他', class: 'category-other' }
};

// 获取DOM元素
function getElements() {
    elements = {
        totalLogs: document.getElementById('totalLogs'),
        totalPhotos: document.getElementById('totalPhotos'),
        daysRecorded: document.getElementById('daysRecorded'),
        logsContainer: document.getElementById('logsContainer'),
        emptyState: document.getElementById('emptyState'),
        addLogBtn: document.getElementById('addLogBtn'),
        logModal: document.getElementById('logModal'),
        detailModal: document.getElementById('detailModal'),
        confirmModal: document.getElementById('confirmModal'),
        closeModal: document.getElementById('closeModal'),
        closeDetail: document.getElementById('closeDetail'),
        cancelBtn: document.getElementById('cancelBtn'),
        logForm: document.getElementById('logForm'),
        modalTitle: document.getElementById('modalTitle'),
        logId: document.getElementById('logId'),
        logDate: document.getElementById('logDate'),
        logTitle: document.getElementById('logTitle'),
        logCategory: document.getElementById('logCategory'),
        logHeight: document.getElementById('logHeight'),
        logWeight: document.getElementById('logWeight'),
        logContent: document.getElementById('logContent'),
        logPhoto: document.getElementById('logPhoto'),
        uploadArea: document.getElementById('uploadArea'),
        photoPreview: document.getElementById('photoPreview'),
        tagsContainer: document.getElementById('tagsContainer'),
        tagInput: document.getElementById('tagInput'),
        detailTitle: document.getElementById('detailTitle'),
        detailBody: document.getElementById('detailBody'),
        editBtn: document.getElementById('editBtn'),
        deleteBtn: document.getElementById('deleteBtn'),
        cancelDelete: document.getElementById('cancelDelete'),
        confirmDelete: document.getElementById('confirmDelete'),
        toast: document.getElementById('toast'),
        toastMessage: document.getElementById('toastMessage'),
        filterBtns: document.querySelectorAll('.filter-btn')
    };
}

// 检查DOM元素是否都存在
function checkElements() {
    const missingElements = [];
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            missingElements.push(key);
        }
    }
    if (missingElements.length > 0) {
        console.error('缺少DOM元素:', missingElements);
        return false;
    }
    return true;
}

// 初始化
async function init() {
    // 获取DOM元素
    getElements();
    
    // 检查元素是否存在
    if (!checkElements()) {
        console.error('DOM元素加载失败，无法初始化应用');
        return;
    }
    
    // 设置今天为默认日期
    elements.logDate.valueAsDate = new Date();
    
    // 绑定事件
    bindEvents();
    
    // 从Supabase加载数据
    await loadLogs();
    
    // 添加一些示例数据（如果没有数据）
    if (logs.length === 0) {
        addSampleData();
    }
}

// 绑定事件
function bindEvents() {
    console.log('开始绑定事件...');
    
    try {
        // 添加日志按钮
        if (elements.addLogBtn) {
            elements.addLogBtn.addEventListener('click', () => {
                console.log('点击了记录新瞬间按钮');
                openModal();
            });
            console.log('添加日志按钮事件绑定成功');
        } else {
            console.error('addLogBtn元素不存在');
        }
        
        // 关闭弹窗
        if (elements.closeModal) {
            elements.closeModal.addEventListener('click', closeModal);
        }
        if (elements.closeDetail) {
            elements.closeDetail.addEventListener('click', closeDetailModal);
        }
        if (elements.cancelBtn) {
            elements.cancelBtn.addEventListener('click', closeModal);
        }
        
        // 点击弹窗外部关闭
        if (elements.logModal) {
            elements.logModal.addEventListener('click', (e) => {
                if (e.target === elements.logModal) closeModal();
            });
        }
        if (elements.detailModal) {
            elements.detailModal.addEventListener('click', (e) => {
                if (e.target === elements.detailModal) closeDetailModal();
            });
        }
        if (elements.confirmModal) {
            elements.confirmModal.addEventListener('click', (e) => {
                if (e.target === elements.confirmModal) closeConfirmModal();
            });
        }
        
        // 表单提交
        if (elements.logForm) {
            elements.logForm.addEventListener('submit', handleSubmit);
        }
        
        // 照片上传
        if (elements.uploadArea && elements.logPhoto) {
            elements.uploadArea.addEventListener('click', () => elements.logPhoto.click());
            elements.logPhoto.addEventListener('change', handlePhotoSelect);
            
            // 拖拽上传
            elements.uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                elements.uploadArea.style.background = 'var(--primary-light)';
            });
            elements.uploadArea.addEventListener('dragleave', () => {
                elements.uploadArea.style.background = '';
            });
            elements.uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                elements.uploadArea.style.background = '';
                handleFiles(e.dataTransfer.files);
            });
        }
        
        // 标签输入
        if (elements.tagInput) {
            elements.tagInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const tag = elements.tagInput.value.trim();
                    if (tag && !tempTags.includes(tag)) {
                        tempTags.push(tag);
                        renderTags();
                        elements.tagInput.value = '';
                    }
                }
            });
        }
        
        // 筛选按钮
        if (elements.filterBtns && elements.filterBtns.length > 0) {
            elements.filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    elements.filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentFilter = btn.dataset.filter;
                    renderLogs();
                });
            });
        }
        
        // 详情页按钮
        if (elements.editBtn) {
            elements.editBtn.addEventListener('click', () => {
                const logId = currentLogId; // 先保存logId
                closeDetailModal();
                openModal(logId);
            });
        }
        if (elements.deleteBtn) {
            elements.deleteBtn.addEventListener('click', () => {
                // 直接打开确认弹窗，不关闭详情弹窗
                // 这样currentLogId不会被重置
                openConfirmModal();
            });
        }
        
        // 确认删除
        if (elements.cancelDelete) {
            elements.cancelDelete.addEventListener('click', closeConfirmModal);
        }
        if (elements.confirmDelete) {
            elements.confirmDelete.addEventListener('click', confirmDelete);
        }
        
        console.log('事件绑定完成');
    } catch (error) {
        console.error('事件绑定失败:', error);
        showToast('事件绑定失败，请刷新页面重试');
    }
}

// 从Supabase加载日志
async function loadLogs() {
    isLoading = true;
    
    try {
        const { data, error } = await supabaseClient
            .from('growth_logs')
            .select('*')
            .order('date', { ascending: false });
        
        if (error) {
            console.error('加载日志失败:', error);
            // 尝试从本地存储恢复
            const localLogs = JSON.parse(localStorage.getItem('growthLogs'));
            if (localLogs) {
                logs = localLogs;
            }
        } else {
            logs = data || [];
            // 保存到本地作为备份
            localStorage.setItem('growthLogs', JSON.stringify(logs));
        }
    } catch (error) {
        console.error('网络错误:', error);
        // 尝试从本地存储恢复
        const localLogs = JSON.parse(localStorage.getItem('growthLogs'));
        if (localLogs) {
            logs = localLogs;
        }
    } finally {
        isLoading = false;
        renderLogs();
        updateStats();
    }
}

// 保存所有日志到Supabase
async function saveLogs() {
    try {
        // 保存到本地作为备份
        localStorage.setItem('growthLogs', JSON.stringify(logs));
        
        // 暂时不批量更新，使用单个操作
    } catch (error) {
        console.error('保存日志失败:', error);
    }
}

// 添加日志到Supabase
async function addLog(logData) {
    try {
        const { data, error } = await supabaseClient
            .from('growth_logs')
            .insert(logData)
            .select();
        
        if (error) {
            console.error('添加日志失败:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('网络错误:', error);
        return false;
    }
}

// 更新日志到Supabase
async function updateLog(logData) {
    try {
        const { data, error } = await supabaseClient
            .from('growth_logs')
            .update(logData)
            .eq('id', logData.id)
            .select();
        
        if (error) {
            console.error('更新日志失败:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('网络错误:', error);
        return false;
    }
}

// 删除日志从Supabase
async function deleteLog(logId) {
    console.log('执行deleteLog函数，删除ID为', logId, '的日志');
    
    try {
        console.log('调用Supabase删除API');
        const { error } = await supabaseClient
            .from('growth_logs')
            .delete()
            .eq('id', logId);
        
        if (error) {
            console.error('Supabase删除失败:', error);
            return false;
        }
        
        console.log('Supabase删除成功');
        return true;
    } catch (error) {
        console.error('删除过程中发生网络错误:', error);
        return false;
    }
}

// 添加示例数据
async function addSampleData() {
    const sampleLogs = [
        {
            id: Date.now() - 100000,
            date: new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0],
            title: '第一次翻身',
            category: 'milestone',
            content: '今天宝宝第一次自己翻身了！虽然有点吃力，但是成功翻过去了，太棒了！爸爸妈妈都为你骄傲。',
            height: '',
            weight: '',
            photos: [],
            tags: ['第一次', '翻身', '里程碑']
        },
        {
            id: Date.now() - 200000,
            date: new Date(Date.now() - 86400000 * 60).toISOString().split('T')[0],
            title: '三个月体检',
            category: 'growth',
            content: '今天去做了三个月体检，医生说宝宝发育得很好，各项指标都在正常范围内。',
            height: '62.5',
            weight: '6.8',
            photos: [],
            tags: ['体检', '健康']
        },
        {
            id: Date.now() - 300000,
            date: new Date(Date.now() - 86400000 * 15).toISOString().split('T')[0],
            title: '第一次去公园',
            category: 'daily',
            content: '今天天气很好，带宝宝去公园散步。宝宝对周围的一切都充满了好奇，眼睛一直转来转去的。',
            height: '',
            weight: '',
            photos: [],
            tags: ['户外', '公园']
        }
    ];
    
    // 添加示例数据到Supabase
    for (const log of sampleLogs) {
        await addLog(log);
    }
    
    // 重新加载数据
    await loadLogs();
}

// 打开弹窗
function openModal(logId = null) {
    console.log('开始打开弹窗，logId:', logId);
    
    try {
        tempPhotos = [];
        tempTags = [];
        renderPhotoPreview();
        renderTags();
        
        if (logId) {
            // 编辑模式
            console.log('编辑模式，查找日志:', logId);
            const log = logs.find(l => l.id === logId);
            if (log) {
                console.log('找到日志:', log.title);
                if (elements.modalTitle) elements.modalTitle.textContent = '✏️ 编辑日志';
                if (elements.logId) elements.logId.value = log.id;
                if (elements.logDate) elements.logDate.value = log.date;
                if (elements.logTitle) elements.logTitle.value = log.title;
                if (elements.logCategory) elements.logCategory.value = log.category;
                if (elements.logHeight) elements.logHeight.value = log.height || '';
                if (elements.logWeight) elements.logWeight.value = log.weight || '';
                if (elements.logContent) elements.logContent.value = log.content || '';
                tempPhotos = log.photos || [];
                tempTags = log.tags || [];
                renderPhotoPreview();
                renderTags();
            } else {
                console.error('未找到日志:', logId);
                showToast('未找到日志');
                return;
            }
        } else {
            // 添加模式
            console.log('添加模式');
            if (elements.modalTitle) elements.modalTitle.textContent = '✨ 记录新瞬间';
            if (elements.logForm) elements.logForm.reset();
            if (elements.logId) elements.logId.value = '';
            if (elements.logDate) elements.logDate.valueAsDate = new Date();
        }
        
        if (elements.logModal) {
            elements.logModal.classList.add('show');
            console.log('弹窗已显示');
        } else {
            console.error('logModal元素不存在');
            showToast('弹窗元素不存在');
            return;
        }
        
        document.body.style.overflow = 'hidden';
        console.log('openModal函数执行完成');
    } catch (error) {
        console.error('openModal函数执行失败:', error);
        showToast('打开弹窗失败，请重试');
    }
}

// 关闭弹窗
function closeModal() {
    console.log('关闭弹窗');
    try {
        if (elements.logModal) {
            elements.logModal.classList.remove('show');
        }
        document.body.style.overflow = '';
    } catch (error) {
        console.error('关闭弹窗失败:', error);
    }
}

// 打开详情弹窗
function openDetailModal(logId) {
    console.log('打开详情弹窗，logId:', logId);
    
    try {
        const log = logs.find(l => l.id === logId);
        if (!log) {
            console.error('未找到日志:', logId);
            showToast('未找到日志');
            return;
        }
        
        currentLogId = logId;
        console.log('设置currentLogId:', currentLogId);
        
        if (elements.detailTitle) {
            elements.detailTitle.textContent = log.title;
        }
        
        const category = categoryConfig[log.category];
        const hasPhotos = log.photos && log.photos.length > 0;
        const hasGrowth = log.height || log.weight;
        
        let html = '';
        
        // 图片或占位符
        if (hasPhotos) {
            html += `<img src="${log.photos[0]}" class="detail-image" alt="${log.title}">`;
        } else {
            const icons = { milestone: '🎯', daily: '🌟', photo: '📸', growth: '📏', other: '💝' };
            html += `<div class="detail-placeholder">${icons[log.category] || '💝'}</div>`;
        }
        
        // 元信息
        html += `
            <div class="detail-meta">
                <div class="detail-meta-item">
                    <span>📅</span>
                    <span>${formatDate(log.date)}</span>
                </div>
                <div class="detail-meta-item">
                    <span>${category.label.split(' ')[0]}</span>
                    <span class="${category.class}" style="padding: 4px 12px; border-radius: 15px;">${category.label.split(' ')[1]}</span>
                </div>
            </div>
        `;
        
        // 成长数据
        if (hasGrowth) {
            html += `
                <div class="detail-growth">
                    <h4>📊 成长数据</h4>
                    <div class="growth-items">
                        ${log.height ? `
                            <div class="growth-item">
                                <span class="growth-icon">📏</span>
                                <div>
                                    <div class="growth-value">${log.height} cm</div>
                                    <div class="growth-label">身高</div>
                                </div>
                            </div>
                        ` : ''}
                        ${log.weight ? `
                            <div class="growth-item">
                                <span class="growth-icon">⚖️</span>
                                <div>
                                    <div class="growth-value">${log.weight} kg</div>
                                    <div class="growth-label">体重</div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        // 内容
        if (log.content) {
            html += `<div class="detail-content-text">${log.content}</div>`;
        }
        
        // 标签
        if (log.tags && log.tags.length > 0) {
            html += `
                <div class="detail-tags">
                    ${log.tags.map(tag => `<span class="detail-tag">#${tag}</span>`).join('')}
                </div>
            `;
        }
        
        if (elements.detailBody) {
            elements.detailBody.innerHTML = html;
        }
        
        if (elements.detailModal) {
            elements.detailModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            console.log('详情弹窗已显示');
        } else {
            console.error('detailModal元素不存在');
            showToast('弹窗元素不存在');
        }
    } catch (error) {
        console.error('打开详情弹窗失败:', error);
        showToast('打开详情失败，请重试');
    }
}

// 关闭详情弹窗
function closeDetailModal() {
    console.log('关闭详情弹窗');
    try {
        if (elements.detailModal) {
            elements.detailModal.classList.remove('show');
        }
        document.body.style.overflow = '';
        currentLogId = null;
        console.log('详情弹窗已关闭，currentLogId重置为:', currentLogId);
    } catch (error) {
        console.error('关闭详情弹窗失败:', error);
    }
}

// 打开确认弹窗
function openConfirmModal() {
    console.log('打开确认弹窗');
    try {
        if (elements.confirmModal) {
            elements.confirmModal.classList.add('show');
            console.log('确认弹窗已显示');
        } else {
            console.error('confirmModal元素不存在');
            showToast('弹窗元素不存在');
        }
    } catch (error) {
        console.error('打开确认弹窗失败:', error);
        showToast('打开确认弹窗失败，请重试');
    }
}

// 关闭确认弹窗
function closeConfirmModal() {
    console.log('关闭确认弹窗');
    try {
        if (elements.confirmModal) {
            elements.confirmModal.classList.remove('show');
            console.log('确认弹窗已关闭');
        }
    } catch (error) {
        console.error('关闭确认弹窗失败:', error);
    }
}

// 确认删除
async function confirmDelete() {
    console.log('开始确认删除，currentLogId:', currentLogId);
    
    if (!currentLogId) {
        console.error('currentLogId为null，无法删除');
        closeConfirmModal();
        return;
    }
    
    if (isLoading) {
        console.log('正在加载中，跳过删除操作');
        return;
    }
    
    isLoading = true;
    console.log('删除操作开始执行');
    
    try {
        console.log('调用deleteLog函数，删除ID为', currentLogId, '的日志');
        const success = await deleteLog(currentLogId);
        console.log('deleteLog函数执行结果:', success);
        
        if (success) {
            console.log('删除成功，更新本地日志列表');
            logs = logs.filter(l => l.id !== currentLogId);
            console.log('本地日志列表已更新，新长度:', logs.length);
            
            console.log('保存日志到本地存储');
            await saveLogs();
            console.log('本地存储已更新');
            
            console.log('重新加载日志以确保数据同步');
            await loadLogs();
            console.log('日志重新加载完成');
            
            showToast('日志已删除');
            console.log('删除操作完成，显示成功提示');
        } else {
            console.log('删除失败，显示失败提示');
            showToast('删除失败，请重试');
        }
    } catch (error) {
        console.error('删除操作异常:', error);
        showToast('操作失败，请重试');
    } finally {
        isLoading = false;
        console.log('删除操作结束，isLoading重置为:', isLoading);
        
        // 先关闭确认弹窗，再关闭详情弹窗
        closeConfirmModal();
        console.log('确认弹窗已关闭');
        
        // 无论删除成功还是失败，都关闭详情弹窗
        closeDetailModal();
        console.log('详情弹窗已关闭');
    }
}

// 处理表单提交
async function handleSubmit(e) {
    e.preventDefault();
    
    if (isLoading) return;
    isLoading = true;
    
    try {
        const logData = {
            id: elements.logId.value ? parseInt(elements.logId.value) : Date.now(),
            date: elements.logDate.value,
            title: elements.logTitle.value.trim(),
            category: elements.logCategory.value,
            height: elements.logHeight.value,
            weight: elements.logWeight.value,
            content: elements.logContent.value.trim(),
            photos: tempPhotos,
            tags: tempTags
        };
        
        let success = false;
        
        if (elements.logId.value) {
            // 编辑
            const index = logs.findIndex(l => l.id === parseInt(elements.logId.value));
            if (index !== -1) {
                logs[index] = logData;
                success = await updateLog(logData);
                if (success) {
                    showToast('日志已更新');
                } else {
                    showToast('更新失败，请重试');
                }
            }
        } else {
            // 添加
            logs.unshift(logData);
            success = await addLog(logData);
            if (success) {
                showToast('日志已添加');
            } else {
                showToast('添加失败，请重试');
            }
        }
        
        if (success) {
            await saveLogs();
            await loadLogs(); // 重新加载以确保数据同步
            closeModal();
        }
    } catch (error) {
        console.error('提交失败:', error);
        showToast('操作失败，请重试');
    } finally {
        isLoading = false;
    }
}

// 处理照片选择
function handlePhotoSelect(e) {
    handleFiles(e.target.files);
}

// 处理文件
function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                tempPhotos.push(e.target.result);
                renderPhotoPreview();
            };
            reader.readAsDataURL(file);
        }
    });
}

// 渲染照片预览
function renderPhotoPreview() {
    if (tempPhotos.length === 0) {
        elements.photoPreview.innerHTML = '';
        return;
    }
    
    elements.photoPreview.innerHTML = tempPhotos.map((photo, index) => `
        <div class="preview-item">
            <img src="${photo}" alt="预览">
            <button type="button" class="preview-remove" onclick="removePhoto(${index})">&times;</button>
        </div>
    `).join('');
}

// 移除照片
function removePhoto(index) {
    tempPhotos.splice(index, 1);
    renderPhotoPreview();
}

// 渲染标签
function renderTags() {
    elements.tagsContainer.innerHTML = tempTags.map((tag, index) => `
        <span class="tag">
            ${tag}
            <button type="button" class="tag-remove" onclick="removeTag(${index})">&times;</button>
        </span>
    `).join('');
}

// 移除标签
function removeTag(index) {
    tempTags.splice(index, 1);
    renderTags();
}

// 渲染日志列表
function renderLogs() {
    let filteredLogs = logs;
    
    if (currentFilter !== 'all') {
        filteredLogs = logs.filter(log => log.category === currentFilter);
    }
    
    // 按日期排序（最新的在前）
    filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredLogs.length === 0) {
        elements.logsContainer.innerHTML = '';
        elements.emptyState.classList.add('show');
        return;
    }
    
    elements.emptyState.classList.remove('show');
    
    elements.logsContainer.innerHTML = filteredLogs.map(log => {
        const category = categoryConfig[log.category];
        const hasPhotos = log.photos && log.photos.length > 0;
        const icons = { milestone: '🎯', daily: '🌟', photo: '📸', growth: '📏', other: '💝' };
        
        return `
            <div class="log-card" onclick="openDetailModal(${log.id})">
                <div class="log-card-image">
                    ${hasPhotos 
                        ? `<img src="${log.photos[0]}" alt="${log.title}">` 
                        : icons[log.category] || '💝'
                    }
                </div>
                <div class="log-card-content">
                    <div class="log-card-header">
                        <div>
                            <div class="log-card-title">${log.title}</div>
                            <div class="log-card-date">📅 ${formatDate(log.date)}</div>
                        </div>
                        <span class="log-card-category ${category.class}">${category.label.split(' ')[1]}</span>
                    </div>
                    ${log.content ? `<div class="log-card-text">${log.content}</div>` : ''}
                    <div class="log-card-footer">
                        <div class="log-card-tags">
                            ${(log.tags || []).slice(0, 2).map(tag => `
                                <span class="log-card-tag">#${tag}</span>
                            `).join('')}
                            ${(log.tags || []).length > 2 ? `<span class="log-card-tag">+${log.tags.length - 2}</span>` : ''}
                        </div>
                        <div class="log-card-stats">
                            ${log.photos && log.photos.length > 0 ? `
                                <span class="log-card-stat">📸 ${log.photos.length}</span>
                            ` : ''}
                            ${(log.height || log.weight) ? `
                                <span class="log-card-stat">📊 数据</span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 更新统计数据
function updateStats() {
    // 总日志数
    elements.totalLogs.textContent = logs.length;
    
    // 总照片数
    const totalPhotos = logs.reduce((sum, log) => sum + (log.photos ? log.photos.length : 0), 0);
    elements.totalPhotos.textContent = totalPhotos;
    
    // 记录天数（不同日期的数量）
    const uniqueDates = new Set(logs.map(log => log.date)).size;
    elements.daysRecorded.textContent = uniqueDates;
}

// 保存到本地存储
function saveLogs() {
    localStorage.setItem('growthLogs', JSON.stringify(logs));
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return '昨天';
    } else {
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
}

// 显示提示
function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// 启动应用
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await init();
    } catch (error) {
        console.error('初始化失败:', error);
        // 即使初始化失败也要确保基本功能可用
        renderLogs();
        updateStats();
    }
});
