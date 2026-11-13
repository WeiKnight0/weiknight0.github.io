export const projectExperience = [
  {
    id: 'intelligent-album',
    repo: 'https://github.com/WeiKnight0/Intelligent-Album',
    tags: ['React', 'TypeScript', 'Spring Boot', 'FastAPI', 'Qdrant'],
    en: {
      title: 'Intelligent Album',
      description: 'An AI-powered photo album with face recognition and natural-language photo search.',
      highlights: [
        'Combines CLIP image embeddings and image-description text embeddings, using reciprocal rank fusion to merge search results.',
        'Integrates InsightFace for face recognition and grouping, with server-sent events for upload, download, and analysis task updates.',
      ],
    },
    'zh-cn': {
      title: 'Intelligent Album · 智能相册',
      description: '集成人脸识别与自然语言图片检索的 AI 相册。',
      highlights: [
        '结合 CLIP 图像向量与图片描述文本向量进行双路检索，通过 RRF 融合排序，支持用自然语言查找图片。',
        '接入 InsightFace 实现人脸识别与人物归组，通过 SSE 推送上传、下载及分析任务状态。',
      ],
    },
  },
  {
    id: 'nyako-wordbook',
    repo: 'https://github.com/WeiKnight0/Nyako-Wordbook',
    tags: ['Tauri 2', 'Rust', 'Vue 3', 'TypeScript', 'SQLite'],
    en: {
      title: 'Nyako Wordbook',
      description: 'A local Japanese vocabulary manager built with Tauri and Rust.',
      highlights: [
        'Manages multiple word senses, examples, kana, and pitch accents, with filtering, sorting, and paginated queries.',
        'Supports XLSX/JSON import previews and transactional commits, plus full backup and restore with SHA-256 verification.',
      ],
    },
    'zh-cn': {
      title: 'Nyako Wordbook · 日语单词本',
      description: '基于 Tauri 与 Rust 的本地日语词库管理应用。',
      highlights: [
        '支持多义项、例句、假名和音调管理，提供筛选、排序与分页查询。',
        '实现 XLSX/JSON 导入预览和事务提交，以及带 SHA-256 校验的完整备份与恢复流程。',
      ],
    },
  },
  {
    id: 'meiancloud-rebirth',
    repo: 'https://github.com/WeiKnight0/meiancloud-rebirth',
    tags: ['Python', 'Django', 'MySQL', 'Docker', 'Nginx'],
    en: {
      title: 'Meian Cloud Rebirth',
      description: 'A continuation of the original Meian Cloud project, presenting Meian’s history and culture at Southeast University.',
      highlights: [
        'Organizes historical content, visitor guides, and topic pages through modular Django applications and templates.',
        'Includes accounts and profiles, threaded comments and administrator moderation, with Gunicorn, Nginx, and Docker Compose deployment configuration.',
      ],
    },
    'zh-cn': {
      title: 'Meian Cloud Rebirth · 梅庵云',
      description: '原梅庵云项目的重置与延续，展示东南大学梅庵的历史与文化。',
      highlights: [
        '使用 Django 模块化组织历史文化内容、导览与专题页面。',
        '提供账户与资料管理、评论回复和管理员审核，并配置 Gunicorn、Nginx 与 Docker Compose 部署。',
      ],
    },
  },
] as const;
