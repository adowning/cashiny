export function logToPage(level: string, ...args: any[]) {
  const c = console as any;
  if (typeof c[level] === "function") {
    c[level](`[${level.toUpperCase()}] useBetterAuth:`, ...args);
  } else {
    console.log(`[${level.toUpperCase()}] useBetterAuth:`, ...args);
  }
}
