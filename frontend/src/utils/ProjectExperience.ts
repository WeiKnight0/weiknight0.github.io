export const projectExperience = [
  {
    id: 'intelligent-album',
    repo: 'https://github.com/WeiKnight0/Intelligent-Album',
    tags: ['Python', 'FastAPI', 'CLIP', 'VLM', 'Qdrant', 'MySQL'],
    en: {
      title: 'Intelligent Album',
      period: 'Sept 2026—Dec 2026',
      role: 'Team project · Search module development',
      description: 'A photo management system with natural-language search and person albums. Responsible for the intelligent search module, connecting image indexing, semantic retrieval, and result ranking.',
      highlights: [
        'Hybrid retrieval: combines CLIP image embeddings with text embeddings of VLM-generated descriptions in separate Qdrant collections. Encodes queries and retrieves candidates concurrently, then applies weighted reciprocal rank fusion (RRF).',
        'Description indexing: generates image descriptions in a background executor and records extraction status, errors, and retry attempts in MySQL. Indexes description embeddings for text-based recall without calling a generative model during search.',
        'Search integration: combines semantic retrieval with filename and person-name matching. Filters vector queries by user ID and retains per-route ranks and scores in fused results for inspection.',
      ],
    },
    'zh-cn': {
      title: 'Intelligent Album · 智能相册',
      period: '2026.09—2026.12',
      role: '合作项目 · 智能检索模块开发',
      description: '支持自然语言搜图与人物相册管理的图片管理系统。负责智能检索模块，串联图片索引、语义召回与结果融合排序流程。',
      highlights: [
        '双路召回与融合排序：将 CLIP 图像向量与 VLM 图片描述的文本向量分别存入 Qdrant 集合，并行完成查询编码与候选召回，采用加权 RRF 融合两路结果。',
        '描述索引与状态管理：通过后台执行器生成图片描述，在 MySQL 中记录提取状态、错误及重试次数，并将描述编码为文本向量；检索时直接查询已有索引，无需实时调用生成模型。',
        '多维检索与用户隔离：接入文件名、人名匹配，补充语义检索入口；向量查询按用户 ID 过滤，融合结果保留各路排名与得分，便于检查召回来源。',
      ],
    },
  },
  {
    id: 'meiancloud-rebirth',
    repo: 'https://github.com/WeiKnight0/meiancloud-rebirth',
    tags: ['Python', 'Django', 'JavaScript', 'MySQL', 'Docker', 'Nginx'],
    en: {
      title: 'Meian Cloud Rebirth',
      period: 'Dec 2024—Feb 2025',
      role: 'Team project · Full-stack development',
      description: 'A continuation of the Meian Cloud cultural heritage website at Southeast University. Responsible for full-stack development of content pages, accounts, and community interactions.',
      highlights: [
        'Application structure: organizes public content, accounts, and community features into Django apps, using templates and JavaScript for page rendering and asynchronous comment interactions.',
        'Accounts and access control: creates users and profiles in one transaction, restricts profile and password changes to the account owner, and requires password verification before account deletion.',
        'Comments and moderation: implements comments and replies with approval-based visibility, owner/admin deletion checks, and administrator review. Uses related-object loading and pagination for the public comment list.',
        'Deployment configuration: configures Gunicorn, Nginx, and Docker Compose, separates development and production startup paths, and supports SQLite or MySQL through environment configuration.',
      ],
    },
    'zh-cn': {
      title: 'Meian Cloud Rebirth · 梅庵云迹',
      period: '2024.12—2025.02',
      role: '合作项目 · 全栈开发',
      description: '东南大学梅庵历史文化展示网站的重置与延续版本。负责全栈开发，涵盖内容页面、账户系统和社区互动功能。',
      highlights: [
        '模块划分与页面交互：通过 Django app 拆分公共内容、账户和社区模块，结合模板与 JavaScript 实现内容展示及评论区异步交互。',
        '账户流程与访问控制：在同一事务内创建用户及资料，限制个人资料和密码修改权限，注销账户前校验密码，覆盖注册、登录、资料维护与注销流程。',
        '评论回复与审核：实现主评论与回复、审核后公开、本人或管理员删除及后台审核；结合关联查询预加载和分页组织公开评论列表。',
        '部署配置：配置 Gunicorn、Nginx 与 Docker Compose，区分开发和生产启动方式，通过环境配置支持 SQLite 或 MySQL 数据库。',
      ],
    },
  },
  {
    id: 'nyako-wordbook',
    repo: 'https://github.com/WeiKnight0/Nyako-Wordbook',
    tags: ['Tauri 2', 'Rust', 'Vue 3', 'TypeScript', 'SQLite'],
    en: {
      title: 'Nyako Wordbook',
      period: 'Nov 2026–Present',
      role: 'Personal interest project · Independent development',
      description: 'A local Japanese vocabulary manager built for personal language learning. Independently develops the Vue interface and Rust storage layer for vocabulary editing, library management, and data exchange.',
      highlights: [
        'Vocabulary storage: models word senses, examples, pitch accents, and shared library membership in SQLite. Routes storage requests through a serial worker and supports filtered, sorted, paginated queries.',
        'Import workflow: stages XLSX/JSON input for validation and preview, exposes identity conflicts and field-level choices, and checks a target-data snapshot before committing changes in a transaction.',
        'Backup and recovery: verifies backup hashes and database integrity, creates a safety backup before restoration, and uses a recovery journal to switch databases or roll back during startup.',
        'Editing experience: retains drafts when saves fail, offers save/discard/continue actions for unsaved edits, and manages stale query responses and list position across navigation.',
      ],
    },
    'zh-cn': {
      title: 'Nyako Wordbook · 日语单词本',
      period: '2026.11—至今',
      role: '个人兴趣项目 · 独立开发',
      description: '面向个人日语学习的本地词库管理应用。独立开发 Vue 界面与 Rust 存储层，覆盖词条编辑、词库管理和数据交换。',
      highlights: [
        '词条建模与存储：使用 SQLite 管理多义项、例句、音调和共享词库成员关系，通过串行存储线程处理数据请求，提供筛选、排序与分页查询。',
        '导入校验与事务提交：将 XLSX/JSON 数据暂存后进行全量校验与预览，提供身份冲突处理和字段级更新选择；提交前核对目标数据快照，再通过事务写入。',
        '备份校验与恢复：校验备份哈希及数据库完整性，恢复前保留当前数据的安全备份，通过恢复日志在下次启动时执行数据库切换或回退。',
        '编辑状态与交互：保存失败时保留草稿，未保存退出时提供保存、放弃和继续编辑选项；处理过期查询响应，并在页面切换时保留列表位置。',
      ],
    },
  },
] as const;
