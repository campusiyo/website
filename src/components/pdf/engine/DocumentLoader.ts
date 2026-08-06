// ============================================================
// DocumentLoader — Progressive PDF loading via HTTP Range Requests
// ============================================================
//
// Responsibilities:
//   • Call pdfjsLib.getDocument() with optimal range-request config
//   • Inject JWT authorization header
//   • Expose the PDFDocumentProxy once metadata is ready
//   • Never wait for full PDF download before resolving
//
// Error handling:
//   TCP stream errors (wsarecv / ECONNRESET / network abort) are retried
//   with exponential back-off up to MAX_RETRIES times before rejecting.
//   This covers the Windows "An established connection was aborted" error
//   that can occur during large PDF range-request streams on unstable
//   connections (Wi-Fi drops, proxies, VPNs, antivirus TLS inspection).
// ============================================================

export interface DocumentLoaderOptions {
  url: string;
  token: string | null;
}

export interface LoadResult {
  doc: any;        // PDFDocumentProxy
  numPages: number;
}

// Retry config for stream/network errors
const MAX_RETRIES   = 3;
const BASE_DELAY_MS = 800; // doubles each attempt: 800 → 1600 → 3200

/** True for transient network/stream errors worth retrying. */
function isRetryable(err: unknown): boolean {
  const msg = String((err as any)?.message ?? err).toLowerCase();
  return (
    msg.includes("stream reading error")  ||
    msg.includes("wsarecv")               ||
    msg.includes("econnreset")            ||
    msg.includes("econnaborted")          ||
    msg.includes("network error")         ||
    msg.includes("fetch")                 ||
    msg.includes("aborted")              ||
    (err as any)?.name === "UnknownErrorException"
  );
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class DocumentLoader {
  private _loadingTask: any | null = null;
  private _destroyed  = false;

  /**
   * Load the PDF document via HTTP Range Requests with automatic retry.
   * Resolves as soon as document metadata is ready — pages are fetched
   * lazily by PDF.js thereafter.
   */
  async load(pdfjsLib: any, options: DocumentLoaderOptions): Promise<LoadResult> {
    // Cancel any previous in-flight load
    this._cancelCurrent();
    this._destroyed = false;

    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (this._destroyed) {
        throw new Error("DocumentLoader destroyed");
      }

      if (attempt > 0) {
        const backoff = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `[DocumentLoader] Retry attempt ${attempt}/${MAX_RETRIES} ` +
          `after ${backoff}ms (reason: ${String(lastError).slice(0, 120)})`
        );
        await delay(backoff);
        if (this._destroyed) throw new Error("DocumentLoader destroyed");
      }

      try {
        const result = await this._loadOnce(pdfjsLib, options);
        return result;
      } catch (err) {
        lastError = err;

        if (!isRetryable(err) || attempt >= MAX_RETRIES) {
          // Non-retryable error or exhausted retries — propagate immediately
          throw err;
        }
        // Otherwise loop and retry
      }
    }

    // Should be unreachable, but TypeScript requires a return
    throw lastError;
  }

  private async _loadOnce(
    pdfjsLib: any,
    options: DocumentLoaderOptions
  ): Promise<LoadResult> {
    const { url, token } = options;

    this._cancelCurrent();

    const task = pdfjsLib.getDocument({
      url,
      httpHeaders: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      withCredentials: true,

      // ── Range request config ──────────────────────────────────────────
      disableRange:     false,
      disableStream:    false,
      disableAutoFetch: false,
      rangeChunkSize:   131072, // 128 KB — smaller chunks reduce loss on abort

      // ── Font resources ────────────────────────────────────────────────
      cMapUrl:    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
      cMapPacked: true,
    });

    this._loadingTask = task;

    // onProgress is informational only — never blocks resolution
    task.onProgress = (_p: { loaded: number; total: number }) => {};

    const doc = await task.promise;

    // Verify the task wasn't destroyed mid-load
    if (this._destroyed) {
      try { doc.destroy(); } catch (_) {}
      throw new Error("DocumentLoader destroyed");
    }

    return { doc, numPages: doc.numPages };
  }

  /** Abort an in-flight document load without triggering retry logic. */
  destroy(): void {
    this._destroyed = true;
    this._cancelCurrent();
  }

  private _cancelCurrent(): void {
    if (this._loadingTask) {
      try { this._loadingTask.destroy(); } catch (_) {}
      this._loadingTask = null;
    }
  }
}
