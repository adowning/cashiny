export const ev = (name: string, fallback: any = null) =>
  Object.prototype.hasOwnProperty.call(process.env, name) ? process.env[name] : fallback
