export interface YouTubeDiagnostics {
  videoId: string | null;
  playerState: number | null;
  errorCode: number | null;
  currentTime: number | null;
  duration: number | null;
  capturedAt: string;
}

let latestDiagnostics: YouTubeDiagnostics = {
  videoId: null,
  playerState: null,
  errorCode: null,
  currentTime: null,
  duration: null,
  capturedAt: new Date().toISOString(),
};

export function setYouTubeDiagnostics(
  diagnostics: Partial<YouTubeDiagnostics>,
) {
  latestDiagnostics = {
    ...latestDiagnostics,
    ...diagnostics,
    capturedAt: new Date().toISOString(),
  };
}

export function getYouTubeDiagnostics(): YouTubeDiagnostics {
  return {
    ...latestDiagnostics,
  };
}

export function resetYouTubeDiagnostics() {
  latestDiagnostics = {
    videoId: null,
    playerState: null,
    errorCode: null,
    currentTime: null,
    duration: null,
    capturedAt: new Date().toISOString(),
  };
}
