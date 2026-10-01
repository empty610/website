import { assetUrl } from './utils/assets.js';

export const site = { url: 'https://empty610.com/', name: 'website · empty610', author: 'empty610' };
export const pages = {
  home: {
    path: '/', label: '个人主页', title: 'empty610｜个人网站与天文学互动项目 · website',
    description: 'empty610 的个人网站，分享天文学兴趣、金星与火星的三维模型、轨道演示和 DC 航天导航互动项目。',
    image: 'images/textures/earth_atmos_2048.jpg', imageAlt: '地球表面贴图：empty610 的天文学互动项目',
  },
  venus: {
    path: '/venus/', label: '金星', title: '金星｜三维模型、地表与轨道演示 · empty610',
    description: '探索金星的三维雷达地表模型、极端大气与地貌，交互查看日心轨道、相位和晨昏星变化。教学演示使用简化模型。',
    image: 'images/venus/venus-surface.jpg', imageAlt: '金星的麦哲伦雷达地表贴图',
  },
  mars: {
    path: '/mars/', label: '火星', title: '火星｜三维模型、巡视器与轨道演示 · empty610',
    description: '探索火星和两颗卫星的三维模型，查看巡视器路线、科研成果、地表地貌及逆行演示。教学演示使用简化模型。',
    image: 'images/mars/mars-texture.jpg', imageAlt: '火星全球表面贴图',
  },
  terminal: {
    path: '/delocalized%20configuration%20project/', label: 'DC INS 航天导航终端', title: 'DC INS｜交互式航天导航终端 · empty610',
    description: '体验 empty610 的 DC INS 航天导航交互终端，查看地球与航天器轨道、任务信息和姿态控制演示。',
    image: 'images/textures/earth_atmos_2048.jpg', imageAlt: 'DC INS 地球与航天器轨道演示使用的地球贴图',
  },
};

const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export const canonicalUrl = page => new URL(page.path, site.url).href;
const imageUrl = page => new URL(assetUrl(page.image), site.url).href;

function tags(page) {
  return [
    ['name', 'description', page.description],
    ['name', 'robots', 'index,follow,max-image-preview:large'],
    ['property', 'og:type', 'website'],
    ['property', 'og:site_name', site.name],
    ['property', 'og:locale', 'zh_CN'],
    ['property', 'og:title', page.title],
    ['property', 'og:description', page.description],
    ['property', 'og:url', canonicalUrl(page)],
    ['property', 'og:image', imageUrl(page)],
    ['property', 'og:image:alt', page.imageAlt],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', page.title],
    ['name', 'twitter:description', page.description],
    ['name', 'twitter:image', imageUrl(page)],
    ['name', 'twitter:image:alt', page.imageAlt],
  ];
}

function schema(page) {
  const url = canonicalUrl(page);
  const graph = [
    { '@type': 'Person', '@id': site.url + '#author', name: site.author, url: site.url },
    { '@type': 'WebSite', '@id': site.url + '#website', url: site.url, name: site.name, alternateName: 'empty610', inLanguage: 'zh-CN', author: { '@id': site.url + '#author' } },
    {
      '@type': 'WebPage', '@id': url + '#page', url, name: page.title, description: page.description, inLanguage: 'zh-CN',
      isPartOf: { '@id': site.url + '#website' }, author: { '@id': site.url + '#author' },
      primaryImageOfPage: { '@type': 'ImageObject', contentUrl: imageUrl(page) },
      ...(page.path === '/' ? {} : { breadcrumb: { '@id': url + '#breadcrumb' } }),
    },
  ];
  if (page.path !== '/') graph.push({
    '@type': 'BreadcrumbList', '@id': url + '#breadcrumb', itemListElement: [
      { '@type': 'ListItem', position: 1, name: site.name, item: site.url },
      { '@type': 'ListItem', position: 2, name: page.label, item: url },
    ],
  });
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c');
}

export function renderSeoHead(page) {
  return [
    `<link data-seo="canonical" rel="canonical" href="${escape(canonicalUrl(page))}">`,
    ...tags(page).map(([attribute, key, content]) => `<meta data-seo="${key}" ${attribute}="${key}" content="${escape(content)}">`),
    `<script data-seo="schema" type="application/ld+json">${schema(page)}</script>`,
  ].join('\n');
}

export function updateSeo(page) {
  document.title = page.title;
  function element(tag, key) {
    let node = document.head.querySelector(`[data-seo="${key}"]`);
    if (!node) {
      node = document.createElement(tag);
      node.dataset.seo = key;
      document.head.append(node);
    }
    return node;
  }
  const canonical = element('link', 'canonical');
  canonical.rel = 'canonical';
  canonical.href = canonicalUrl(page);
  for (const [attribute, key, content] of tags(page)) {
    const node = element('meta', key);
    node.setAttribute(attribute, key);
    node.content = content;
  }
  const structured = element('script', 'schema');
  structured.type = 'application/ld+json';
  structured.textContent = schema(page);
}
