const scripts = document.getElementsByTagName('script');
const index = scripts.length - 1;
const tag = scripts[index];
const src = tag.src;
const root = src.substring(0, src.lastIndexOf('/'));
const path = root.replace(/^(https?:\/\/)?[^/]+/, '');
const host = root.replace(path, '');

const currentScript = {
    tag,
    src,
    path,
    root,
    host
};

module.exports = currentScript;
