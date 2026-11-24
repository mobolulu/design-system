import React from 'react';
import { ChevronLeft, ChevronRight, Plus, RotateCw, Star, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Spinner } from './Spinner';

/** One picture already in the gallery. */
export interface GalleryImage {
  id: string;
  url: string;
  isMain?: boolean;
}

export interface GalleryUploadOptions {
  /** Report upload progress as a fraction, 0–1. Optional — without it the tile shows a spinner. */
  onProgress: (fraction: number) => void;
}

export interface ImageGalleryFieldProps {
  label?: string;
  hint?: string;
  /** An error the form owns (e.g. "At least one picture is required"). Shown under the field. */
  error?: string;
  id?: string;
  /** The gallery, in order. Controlled. */
  value: GalleryImage[];
  onChange: (next: GalleryImage[]) => void;
  /**
   * Stores one file and resolves with what the gallery should hold. The
   * component knows nothing about where pictures go (orchestrator#542) —
   * the console wires this to service-attachments.
   */
  onUpload: (file: File, options: GalleryUploadOptions) => Promise<{ id: string; url: string }>;
  /** Called when a thumbnail is clicked; the zooming viewer belongs to the app. */
  onPreview?: (index: number) => void;
  /** At most this many pictures. Default 10. */
  max?: number;
  /** Per-file size limit, in bytes. */
  maxFileSize?: number;
  /** Accepted MIME types. Default jpeg, png and webp. */
  accept?: string[];
  /**
   * Offers "Set as main" and marks one picture **Main**. The first picture
   * is main by default; removing the main promotes the next one.
   */
  selectableMain?: boolean;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];

const TYPE_NAMES: Record<string, string> = {
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/gif': 'GIF',
};

/** Every tile is the same shape, whatever the picture's own — the KYC gallery's tile. */
const TILE = 'relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-muted';
const TILE_MESSAGE = `${TILE} flex items-center justify-center px-3 text-center text-xs text-muted-foreground`;

const ICON_BUTTON =
  'inline-flex h-7 w-7 items-center justify-center rounded-md bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 [&>svg]:h-3.5 [&>svg]:w-3.5';

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${+(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function listTypes(accept: string[]): string {
  const names = accept.map((t) => TYPE_NAMES[t] ?? t);
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} or ${names[names.length - 1]}`;
}

/** Exactly one main when the gallery is not empty: keep the flagged one, else the first. */
function withOneMain(images: GalleryImage[]): GalleryImage[] {
  if (images.length === 0) return images;
  const main = images.find((i) => i.isMain)?.id ?? images[0].id;
  return images.map((i) => ({ ...i, isMain: i.id === main }));
}

interface PendingUpload {
  key: string;
  file: File;
  previewUrl: string | null;
  status: 'uploading' | 'failed';
  progress: number | null;
}

let pendingSeq = 0;

/**
 * A picture gallery form field (orchestrator#542): drag and drop or browse,
 * thumbnails with remove and reorder, a "3 / 10" counter, and optionally a
 * main picture. Used by Waste Types sample images (#531) and Vehicle Types
 * pictures (#539).
 */
export const ImageGalleryField: React.FC<ImageGalleryFieldProps> = ({
  label,
  hint,
  error,
  id,
  value,
  onChange,
  onUpload,
  onPreview,
  max = 10,
  maxFileSize,
  accept = DEFAULT_ACCEPT,
  selectableMain = false,
  disabled = false,
  className,
}) => {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [pending, setPending] = React.useState<PendingUpload[]>([]);
  const [rejections, setRejections] = React.useState<string[]>([]);
  const [announcement, setAnnouncement] = React.useState('');
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [dropActive, setDropActive] = React.useState(false);

  // Uploads finish after the render that started them, possibly several
  // before the parent re-renders — each must build on the newest gallery,
  // not the one it closed over.
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const commit = (next: GalleryImage[]) => {
    const settled = selectableMain ? withOneMain(next) : next;
    valueRef.current = settled;
    onChange(settled);
  };

  const pendingRef = React.useRef(pending);
  pendingRef.current = pending;
  React.useEffect(
    () => () => {
      for (const p of pendingRef.current) if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
    },
    [],
  );

  const used = value.length + pending.length;
  const full = used >= max;

  const start = (upload: PendingUpload) => {
    const update = (patch: Partial<PendingUpload>) =>
      setPending((all) => all.map((p) => (p.key === upload.key ? { ...p, ...patch } : p)));
    onUpload(upload.file, { onProgress: (fraction) => update({ progress: Math.max(0, Math.min(1, fraction)) }) }).then(
      (stored) => {
        setPending((all) => all.filter((p) => p.key !== upload.key));
        if (upload.previewUrl) URL.revokeObjectURL(upload.previewUrl);
        commit([...valueRef.current, { id: stored.id, url: stored.url }]);
      },
      () => update({ status: 'failed', progress: null }),
    );
  };

  const addFiles = (files: File[]) => {
    if (disabled || files.length === 0) return;
    const problems: string[] = [];
    const room = max - used;
    const accepted: File[] = [];
    for (const file of files) {
      if (!accept.includes(file.type)) {
        problems.push(`${file.name} is not a ${listTypes(accept)} image.`);
      } else if (maxFileSize != null && file.size > maxFileSize) {
        problems.push(`${file.name} is larger than ${formatBytes(maxFileSize)}.`);
      } else {
        accepted.push(file);
      }
    }
    const overflow = accepted.length - Math.max(0, room);
    if (overflow > 0) {
      problems.push(
        `At most ${max} pictures — ${overflow} ${overflow === 1 ? 'was' : 'were'} not added.`,
      );
      accepted.splice(Math.max(0, room));
    }
    setRejections(problems);
    const uploads = accepted.map<PendingUpload>((file) => ({
      key: `upload-${++pendingSeq}`,
      file,
      previewUrl: typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : null,
      status: 'uploading',
      progress: null,
    }));
    setPending((all) => [...all, ...uploads]);
    uploads.forEach(start);
  };

  const retry = (key: string) => {
    const upload = pending.find((p) => p.key === key);
    if (!upload) return;
    const again = { ...upload, status: 'uploading' as const, progress: null };
    setPending((all) => all.map((p) => (p.key === key ? again : p)));
    start(again);
  };

  const discard = (key: string) => {
    const upload = pending.find((p) => p.key === key);
    if (upload?.previewUrl) URL.revokeObjectURL(upload.previewUrl);
    setPending((all) => all.filter((p) => p.key !== key));
  };

  const remove = (index: number) => {
    const removed = value[index];
    const rest = value.filter((_, i) => i !== index);
    // The next picture takes the main's place — or the one before it when the main was last.
    if (selectableMain && removed?.isMain && rest.length > 0) {
      const heir = rest[Math.min(index, rest.length - 1)].id;
      commit(rest.map((i) => ({ ...i, isMain: i.id === heir })));
    } else {
      commit(rest);
    }
    setAnnouncement(`Picture ${index + 1} removed.`);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [picked] = next.splice(from, 1);
    next.splice(to, 0, picked);
    commit(next);
    setAnnouncement(`Picture moved to position ${to + 1} of ${value.length}.`);
  };

  const setMain = (index: number) => {
    commit(value.map((img, i) => ({ ...img, isMain: i === index })));
    setAnnouncement(`Picture ${index + 1} is now the main picture.`);
  };

  const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files');

  const messages = [...(error ? [error] : []), ...rejections];
  const describedBy = [messages.length ? `${fieldId}-error` : null, hint ? `${fieldId}-hint` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role="group"
      aria-labelledby={label ? `${fieldId}-label` : undefined}
      aria-describedby={describedBy || undefined}
      className={cn('flex flex-col gap-2', className)}
    >
      <div className="flex items-baseline justify-between gap-3">
        {label ? (
          <span id={`${fieldId}-label`} className="text-sm font-medium text-foreground">
            {label}
          </span>
        ) : (
          <span />
        )}
        <span className="text-xs tabular-nums text-muted-foreground">
          {value.length} / {max}
        </span>
      </div>

      <div
        data-testid="image-gallery-dropzone"
        onDragOver={(e) => {
          if (!hasFiles(e) || disabled || full) return;
          e.preventDefault();
          setDropActive(true);
        }}
        onDragLeave={() => setDropActive(false)}
        onDrop={(e) => {
          if (!hasFiles(e)) return;
          e.preventDefault();
          setDropActive(false);
          addFiles(Array.from(e.dataTransfer.files));
        }}
        className={cn(
          'grid grid-cols-2 gap-3 rounded-xl p-1 transition-colors sm:grid-cols-3 lg:grid-cols-5',
          dropActive && 'bg-primary/5 ring-2 ring-primary/40',
        )}
      >
        {value.length === 0 && pending.length === 0 ? (
          <div className={TILE_MESSAGE}>No pictures yet</div>
        ) : null}

        {value.map((img, index) => (
          <div
            key={img.id}
            draggable={!disabled}
            onDragStart={(e) => {
              setDragIndex(index);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', img.id);
            }}
            onDragEnd={() => setDragIndex(null)}
            onDragOver={(e) => {
              if (dragIndex === null) return;
              e.preventDefault();
            }}
            onDrop={(e) => {
              if (dragIndex === null) return;
              e.preventDefault();
              e.stopPropagation();
              move(dragIndex, index);
              setDragIndex(null);
            }}
            className={cn('group', TILE, dragIndex === index && 'opacity-50')}
          >
            <button
              type="button"
              onClick={() => onPreview?.(index)}
              disabled={!onPreview}
              aria-label={`Open picture ${index + 1}`}
              className="block h-full w-full cursor-zoom-in disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <img src={img.url} alt={`Picture ${index + 1}`} className="h-full w-full object-cover" draggable={false} />
            </button>

            {selectableMain && img.isMain ? (
              <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                <Star aria-hidden className="h-3 w-3 fill-current" />
                Main
              </span>
            ) : null}

            {!disabled ? (
              <>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Remove picture ${index + 1}`}
                  className={cn(ICON_BUTTON, 'absolute right-1.5 top-1.5')}
                >
                  <X aria-hidden />
                </button>
                <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, index - 1)}
                      disabled={index === 0}
                      aria-label={`Move picture ${index + 1} earlier`}
                      className={ICON_BUTTON}
                    >
                      <ChevronLeft aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, index + 1)}
                      disabled={index === value.length - 1}
                      aria-label={`Move picture ${index + 1} later`}
                      className={ICON_BUTTON}
                    >
                      <ChevronRight aria-hidden />
                    </button>
                  </div>
                  {selectableMain && !img.isMain ? (
                    <button
                      type="button"
                      onClick={() => setMain(index)}
                      aria-label={`Set picture ${index + 1} as main`}
                      className="h-7 rounded-md bg-background/90 px-2 text-[11px] font-semibold text-foreground shadow-sm hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Set as main
                    </button>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        ))}

        {pending.map((p) => (
          <div
            key={p.key}
            role="group"
            className={TILE}
            aria-busy={p.status === 'uploading'}
            aria-label={p.status === 'uploading' ? `Uploading ${p.file.name}` : `${p.file.name} failed to upload`}
          >
            {p.previewUrl ? (
              <img src={p.previewUrl} alt="" className="h-full w-full object-cover opacity-40" />
            ) : null}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center text-xs">
              {p.status === 'uploading' ? (
                p.progress == null ? (
                  <Spinner size="sm" />
                ) : (
                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(p.progress * 100)}
                    aria-label={`Uploading ${p.file.name}`}
                    className="h-1.5 w-3/4 overflow-hidden rounded-full bg-background"
                  >
                    <div className="h-full bg-primary transition-[width]" style={{ width: `${p.progress * 100}%` }} />
                  </div>
                )
              ) : (
                <>
                  <span className="font-medium text-destructive">Upload failed</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => retry(p.key)}
                      aria-label={`Retry ${p.file.name}`}
                      className={ICON_BUTTON}
                    >
                      <RotateCw aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => discard(p.key)}
                      aria-label={`Discard ${p.file.name}`}
                      className={ICON_BUTTON}
                    >
                      <X aria-hidden />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || full}
          aria-label="Add pictures"
          className={cn(
            TILE,
            'flex flex-col items-center justify-center gap-1 border-dashed bg-background px-3 text-center text-xs text-muted-foreground',
            'transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:text-muted-foreground',
          )}
        >
          <Plus aria-hidden className="h-5 w-5" />
          {full ? `Limit of ${max} reached` : 'Drop pictures or browse'}
        </button>
      </div>

      <input
        ref={inputRef}
        id={fieldId}
        type="file"
        multiple
        accept={accept.join(',')}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        data-testid="image-gallery-input"
        onChange={(e) => {
          addFiles(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />

      {messages.length ? (
        <div id={`${fieldId}-error`} role="alert" className="flex flex-col gap-0.5 text-xs text-destructive">
          {messages.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      ) : null}
      {hint ? (
        <span id={`${fieldId}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </span>
      ) : null}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
};
ImageGalleryField.displayName = 'ImageGalleryField';
