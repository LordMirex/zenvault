import { randomBytes, randomUUID } from 'crypto';

const normalizeLabel = (value, fallback) => {
  const next = String(value ?? '').trim();
  return next || fallback;
};

const localIpv4Patterns = [/^127\./, /^::1$/, /^::ffff:127\./];
const privateIpv4Patterns = [
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^::ffff:10\./,
  /^::ffff:192\.168\./,
  /^::ffff:172\.(1[6-9]|2\d|3[0-1])\./,
];

export const normalizeTwoFactorState = (value) => {
  const source = value && typeof value === 'object' ? value : {};
  const recoveryCodes = Array.isArray(source.recoveryCodes)
    ? source.recoveryCodes
      .map((code) => String(code ?? '').trim())
      .filter(Boolean)
      .slice(0, 8)
    : [];

  return {
    enabled: source.enabled === true,
    recoveryCodes,
    lastUpdated: normalizeLabel(source.lastUpdated, source.enabled === true ? 'Enabled' : 'Not enabled'),
  };
};

export const generateRecoveryCodes = (count = 6) =>
  Array.from({ length: count }, () => `${randomBytes(2).toString('hex').toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`);

export const parseSessionList = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .filter((entry) => entry && typeof entry === 'object')
      .map((entry) => ({
        id: normalizeLabel(entry.id, randomUUID()),
        device: normalizeLabel(entry.device, 'Unknown device'),
        location: normalizeLabel(entry.location, 'Unknown network'),
        status: entry.status === 'Revoked' ? 'Revoked' : entry.status === 'Current session' ? 'Current session' : 'Active',
        lastSeen: normalizeLabel(entry.lastSeen, 'Recently active'),
      }));
  }

  try {
    return parseSessionList(JSON.parse(value));
  } catch {
    return [];
  }
};

export const createSessionId = () => randomUUID();

export const describeDevice = (userAgent = '') => {
  const source = String(userAgent ?? '').toLowerCase();
  const isMobile = /android|iphone|mobile/.test(source);
  const isTablet = !isMobile && /ipad|tablet/.test(source);
  const os = source.includes('windows')
    ? 'Windows'
    : source.includes('android')
      ? 'Android'
      : source.includes('iphone') || source.includes('ipad') || source.includes('ios')
        ? 'iOS'
        : source.includes('mac os x') || source.includes('macintosh')
          ? 'macOS'
          : source.includes('linux')
            ? 'Linux'
            : 'Unknown OS';
  const browser = source.includes('edg/')
    ? 'Edge'
    : source.includes('chrome/') && !source.includes('edg/')
      ? 'Chrome'
      : source.includes('firefox/')
        ? 'Firefox'
        : source.includes('safari/') && !source.includes('chrome/')
          ? 'Safari'
          : 'Browser';

  if (isMobile) {
    return `${os} ${browser} mobile`;
  }

  if (isTablet) {
    return `${os} ${browser} tablet`;
  }

  return `${os} ${browser} desktop`;
};

export const describeLocation = (ipAddress = '') => {
  const source = String(ipAddress ?? '').trim();

  if (!source) {
    return 'Unknown network';
  }

  if (localIpv4Patterns.some((pattern) => pattern.test(source))) {
    return 'Localhost session';
  }

  if (privateIpv4Patterns.some((pattern) => pattern.test(source)) || source.startsWith('fc') || source.startsWith('fd') || source.startsWith('fe80')) {
    return 'Private network';
  }

  return 'Remote network';
};

export const issueSession = (sessions, { sessionId = createSessionId(), userAgent = '', ipAddress = '', lastSeen = 'Recently active', maxSessions = 8 } = {}) => {
  const previous = parseSessionList(sessions).map((session) => (
    session.status === 'Revoked'
      ? session
      : { ...session, status: 'Active' }
  ));

  const nextSession = {
    id: sessionId,
    device: describeDevice(userAgent),
    location: describeLocation(ipAddress),
    status: 'Current session',
    lastSeen,
  };

  return [nextSession, ...previous].slice(0, maxSessions);
};

export const findActiveSession = (sessions, sessionId) =>
  parseSessionList(sessions).find((session) => session.id === sessionId && session.status !== 'Revoked') ?? null;

export const revokeSession = (sessions, sessionId, lastSeen = 'Session ended') => {
  let found = false;
  const nextSessions = parseSessionList(sessions).map((session) => {
    if (session.id !== sessionId) {
      return session;
    }

    found = true;
    return {
      ...session,
      status: 'Revoked',
      lastSeen,
    };
  });

  return {
    found,
    sessions: nextSessions,
  };
};

export const revokeOtherSessions = (sessions, activeSessionId, lastSeen = 'Security update') =>
  parseSessionList(sessions).map((session) => {
    if (session.id === activeSessionId) {
      return {
        ...session,
        status: 'Current session',
        lastSeen,
      };
    }

    if (session.status === 'Revoked') {
      return session;
    }

    return {
      ...session,
      status: 'Revoked',
      lastSeen,
    };
  });
