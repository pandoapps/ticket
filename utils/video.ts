export interface VideoEmbed {
  kind: 'iframe' | 'video';
  src: string;
}

const FILE_EXTENSIONS = /\.(mp4|webm|ogg|m3u8)(\?.*)?$/i;

export function toVideoEmbed(url: string | null): VideoEmbed | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, '');

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    if (parsed.pathname === '/watch' && parsed.searchParams.get('v')) {
      return { kind: 'iframe', src: `https://www.youtube.com/embed/${parsed.searchParams.get('v')}` };
    }
    const shorts = parsed.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]+)/);
    if (shorts) return { kind: 'iframe', src: `https://www.youtube.com/embed/${shorts[1]}` };
  }

  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1).split('/')[0];
    if (id) return { kind: 'iframe', src: `https://www.youtube.com/embed/${id}` };
  }

  if (host === 'vimeo.com') {
    const id = parsed.pathname.match(/^\/(\d+)/);
    if (id) return { kind: 'iframe', src: `https://player.vimeo.com/video/${id[1]}` };
  }

  if (FILE_EXTENSIONS.test(parsed.pathname)) {
    return { kind: 'video', src: url };
  }

  return { kind: 'iframe', src: url };
}
