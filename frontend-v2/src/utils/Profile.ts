import { sitePath } from './paths.mjs';

export const Profile = {
  name: 'WEIKNIGHT',
  handle: 'WeiKnight',
  tagline: 'A Wolf Programmer from China',
  location: 'Nanjing, Jiangsu Province, China',
  school: 'Southeast University, China',
  github: 'https://github.com/WeiKnight0',
  avatar: sitePath('/images/github-avatar.jpg'),
  techStack: ['C/C++', 'Python', 'Java'],
} as const;
