CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  tags VARCHAR(500) NOT NULL DEFAULT '',
  repo_url VARCHAR(500)
);

CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  tags VARCHAR(500) NOT NULL DEFAULT ''
);

CREATE TABLE contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(320) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO projects (slug, title, description, display_order, tags, repo_url) VALUES
('homepage', 'Homepage', '使用 Astro 构建的个人主页，连接现实作品集与幻想档案。', 1, 'Astro,TypeScript,Tailwind CSS', 'https://github.com/WeiKnight0/WeiKnight0.github.io');

INSERT INTO posts (slug, title, description, published_at, tags) VALUES
('how-to-overleaf', 'How to Install Overleaf with docker on Linux', 'Install and configure Overleaf with Docker on Linux.', '2025-10-07T10:20:43Z', 'docker,ubuntu,linux,overleaf'),
('how-to-conda', 'How to Use Conda for Deep Learning', 'Set up a Conda-based deep learning environment on Linux.', '2026-03-27T14:53:42Z', 'conda,python,deep-learning,linux'),
('how-to-prepare-your-new-linux-system', 'How to Prepare Your New Linux System', 'A checklist for preparing a new Linux development system.', '2026-03-27T14:03:40Z', 'linux,ubuntu,wsl,zsh,cuda');
