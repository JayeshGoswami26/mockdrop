export function createSystemGenerator(prng) {
  const mimeTypes = [
    'application/json', 'application/xml', 'text/html', 'text/plain', 'text/css',
    'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'audio/mpeg',
    'video/mp4', 'application/pdf', 'application/zip', 'application/javascript'
  ];

  const fileExts = [
    '.pdf', '.csv', '.json', '.xml', '.txt', '.doc', '.docx', '.xls', '.xlsx',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.mp3', '.mp4', '.zip', '.tar.gz'
  ];

  return {
    uuid() {
      // RFC 4122 v4 UUID
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = prng.int(0, 15);
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
    objectId() {
      return prng.string(24, 'abcdef0123456789');
    },
    fileName(ext) {
      const extension = ext || this.fileExt();
      const base = prng.pick(['report', 'data', 'export', 'backup', 'image', 'document', 'profile', 'config', 'log', 'archive']);
      const suffix = prng.bool(0.7) ? `_${prng.int(1, 999)}` : (prng.bool(0.5) ? `_v${prng.int(1, 10)}` : '');
      return `${base}${suffix}${extension}`;
    },
    fileExt() {
      return prng.pick(fileExts);
    },
    mimeType() {
      return prng.pick(mimeTypes);
    },
    semver() {
      return `${prng.int(0, 5)}.${prng.int(0, 20)}.${prng.int(0, 50)}`;
    },
    filePath() {
      const os = prng.pick(['linux', 'windows']);
      const filename = this.fileName();
      if (os === 'windows') {
        const drive = prng.pick(['C', 'D']);
        const dir = prng.pick(['Users\\Public\\Documents', 'Windows\\System32', 'Program Files\\App', 'temp']);
        return `${drive}:\\${dir}\\${filename}`;
      } else {
        const dir = prng.pick(['/home/user/documents', '/var/www/html', '/tmp', '/usr/local/bin', '/etc']);
        return `${dir}/${filename}`;
      }
    },
    directoryPath() {
      const os = prng.pick(['linux', 'windows']);
      if (os === 'windows') {
        return prng.pick(['C:\\Users\\Public\\Documents', 'C:\\Windows\\System32', 'D:\\Data\\Backups', 'C:\\temp']);
      } else {
        return prng.pick(['/home/user/documents', '/var/www/html/assets', '/tmp/cache', '/usr/local/lib', '/var/log']);
      }
    },
    commonFileType() {
      return prng.pick(['document', 'image', 'video', 'audio', 'archive', 'script', 'spreadsheet']);
    }
  };
}
