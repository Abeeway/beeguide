const firmwareLatest = require('../../docs/06-firmware-reference-guide/_firmware-latest_.json');

const latestBase = '/docs/firmware-reference-guide/latest';
const versionedBase = `/docs/firmware-reference-guide/${firmwareLatest.version}`;
const defaultBaseUrl = '/';

function normalizeBaseUrl(baseUrl) {
  if (typeof baseUrl !== 'string' || baseUrl === '') {
    return defaultBaseUrl;
  }

  if (baseUrl === '/') {
    return '/';
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function rewriteUrl(url) {
  if (typeof url !== 'string' || !url.startsWith(latestBase)) {
    return url;
  }

  if (url === latestBase) {
    return url;
  }

  return `${versionedBase}${url.slice(latestBase.length)}`;
}

function rewriteHtmlValue(value, baseUrl) {
  if (typeof value !== 'string' || !value.includes(latestBase)) {
    return value;
  }

  return value.replace(
    /((?:href|src)\s*=\s*["'])\/docs\/firmware-reference-guide\/latest([^"']*)(["'])/g,
    (_, prefix, rest, suffix) =>
      `${prefix}${baseUrl}${versionedBase}${rest}${suffix}`,
  );
}

function rewriteLatestLinks(node) {
  if (!node || typeof node !== 'object') {
    return;
  }

  if (typeof node.url === 'string') {
    node.url = rewriteUrl(node.url);
  }

  if (typeof node.value === 'string') {
    node.value = rewriteHtmlValue(node.value, rewriteLatestLinks.baseUrl);
  }

  if (Array.isArray(node.attributes)) {
    node.attributes.forEach((attribute) => {
      if (
        attribute &&
        attribute.type === 'mdxJsxAttribute' &&
        attribute.name === 'href' &&
        typeof attribute.value === 'string'
      ) {
        const rewrittenUrl = rewriteUrl(attribute.value);
        attribute.value = rewrittenUrl.startsWith('/docs/')
          ? `${rewriteLatestLinks.baseUrl}${rewrittenUrl}`
          : rewrittenUrl;
      }
    });
  }

  if (Array.isArray(node.children)) {
    node.children.forEach(rewriteLatestLinks);
  }
}

module.exports = function remarkFirmwareLatestLinks(options = {}) {
  rewriteLatestLinks.baseUrl = normalizeBaseUrl(options.baseUrl);

  return (tree) => {
    rewriteLatestLinks(tree);
  };
};
