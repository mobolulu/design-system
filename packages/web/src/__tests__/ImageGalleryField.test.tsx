import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ImageGalleryField, type GalleryImage, type ImageGalleryFieldProps } from '../components/ImageGalleryField';

const png = (name: string, size = 10) => new File([new Uint8Array(size)], name, { type: 'image/png' });

const pics = (n: number, main?: number): GalleryImage[] =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, url: `https://x/p${i + 1}.png`, isMain: main === i }));

/** The field is controlled; this keeps its value the way a form would and exposes it. */
function Harness({
  initial = [],
  onValue,
  ...props
}: Partial<ImageGalleryFieldProps> & { initial?: GalleryImage[]; onValue?: (v: GalleryImage[]) => void }) {
  const [value, setValue] = useState<GalleryImage[]>(initial);
  let seq = 0;
  return (
    <ImageGalleryField
      label="Pictures"
      onUpload={async (file) => ({ id: `up-${file.name}-${++seq}`, url: `https://x/${file.name}` })}
      {...props}
      value={value}
      onChange={(v) => {
        setValue(v);
        onValue?.(v);
      }}
    />
  );
}

const pick = (...files: File[]) =>
  fireEvent.change(screen.getByTestId('image-gallery-input'), { target: { files } });

const srcs = () => screen.queryAllByRole('img').map((img) => img.getAttribute('src'));

describe('ImageGalleryField', () => {
  it('shows the placeholder and a 0 / 10 counter when empty', () => {
    render(<Harness />);
    expect(screen.getByText('No pictures yet')).toBeInTheDocument();
    expect(screen.getByText('0 / 10')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Pictures' })).toBeInTheDocument();
  });

  it('uploads picked files through onUpload and adds them in order', async () => {
    const onUpload = vi.fn(async (file: File) => ({ id: file.name, url: `https://x/${file.name}` }));
    render(<Harness onUpload={onUpload} />);
    pick(png('a.png'), png('b.png'));
    await waitFor(() => expect(srcs()).toEqual(['https://x/a.png', 'https://x/b.png']));
    expect(onUpload).toHaveBeenCalledTimes(2);
    expect(screen.getByText('2 / 10')).toBeInTheDocument();
    expect(screen.queryByText('No pictures yet')).not.toBeInTheDocument();
  });

  it('accepts files dropped on the field', async () => {
    render(<Harness />);
    fireEvent.drop(screen.getByTestId('image-gallery-dropzone'), {
      dataTransfer: { types: ['Files'], files: [png('dropped.png')] },
    });
    await waitFor(() => expect(srcs()).toEqual(['https://x/dropped.png']));
  });

  it('rejects the wrong type and an oversized file with a message under the field', () => {
    const onUpload = vi.fn();
    render(<Harness onUpload={onUpload} maxFileSize={1024 * 1024} />);
    pick(new File(['x'], 'anim.gif', { type: 'image/gif' }), png('huge.png', 2 * 1024 * 1024));
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('anim.gif is not a JPEG, PNG or WebP image.');
    expect(alert).toHaveTextContent('huge.png is larger than 1 MB.');
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('stops at max: the add tile disables and the extra files are refused', async () => {
    render(<Harness initial={pics(9)} max={10} />);
    pick(png('ten.png'), png('eleven.png'));
    expect(screen.getByRole('alert')).toHaveTextContent('At most 10 pictures — 1 was not added.');
    await waitFor(() => expect(screen.getByText('10 / 10')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Add pictures' })).toBeDisabled();
    expect(screen.getByText('Limit of 10 reached')).toBeInTheDocument();
  });

  it('shows progress while uploading, and a failed tile can be retried', async () => {
    let reject!: () => void;
    let report!: (f: number) => void;
    const onUpload = vi
      .fn<Parameters<ImageGalleryFieldProps['onUpload']>, ReturnType<ImageGalleryFieldProps['onUpload']>>()
      .mockImplementationOnce(
        (_file, { onProgress }) =>
          new Promise((_, no) => {
            report = onProgress;
            reject = () => no(new Error('network'));
          }),
      )
      .mockImplementationOnce(async () => ({ id: 'ok', url: 'https://x/ok.png' }));
    render(<Harness onUpload={onUpload} />);
    pick(png('a.png'));
    expect(screen.getByRole('group', { name: 'Uploading a.png' })).toBeInTheDocument();
    act(() => report(0.4));
    expect(screen.getByRole('progressbar', { name: 'Uploading a.png' })).toHaveAttribute('aria-valuenow', '40');

    await act(async () => reject());
    expect(await screen.findByText('Upload failed')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry a.png' }));
    await waitFor(() => expect(srcs()).toEqual(['https://x/ok.png']));
    expect(screen.queryByText('Upload failed')).not.toBeInTheDocument();
  });

  it('a failed upload can be discarded', async () => {
    render(<Harness onUpload={() => Promise.reject(new Error('no'))} />);
    pick(png('a.png'));
    fireEvent.click(await screen.findByRole('button', { name: 'Discard a.png' }));
    expect(screen.getByText('No pictures yet')).toBeInTheDocument();
  });

  it('removes a picture', () => {
    const onValue = vi.fn();
    render(<Harness initial={pics(3)} onValue={onValue} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove picture 2' }));
    expect(onValue).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: 'p1' }),
      expect.objectContaining({ id: 'p3' }),
    ]);
    expect(screen.getByText('2 / 10')).toBeInTheDocument();
  });

  it('reorders with the keyboard-operable move buttons', () => {
    render(<Harness initial={pics(3)} />);
    expect(screen.getByRole('button', { name: 'Move picture 1 earlier' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Move picture 1 later' }));
    expect(srcs()).toEqual(['https://x/p2.png', 'https://x/p1.png', 'https://x/p3.png']);
    expect(screen.getByText('Picture moved to position 2 of 3.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move picture 3 later' })).toBeDisabled();
  });

  it('reorders by dragging one tile onto another', () => {
    render(<Harness initial={pics(3)} />);
    const tiles = screen.getAllByRole('img').map((img) => img.closest('[draggable]')!);
    const dataTransfer = { types: ['text/plain'], setData: vi.fn(), effectAllowed: '' };
    fireEvent.dragStart(tiles[2], { dataTransfer });
    fireEvent.dragOver(tiles[0], { dataTransfer });
    fireEvent.drop(tiles[0], { dataTransfer });
    expect(srcs()).toEqual(['https://x/p3.png', 'https://x/p1.png', 'https://x/p2.png']);
  });

  it('calls onPreview with the index of the clicked thumbnail', () => {
    const onPreview = vi.fn();
    render(<Harness initial={pics(2)} onPreview={onPreview} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open picture 2' }));
    expect(onPreview).toHaveBeenCalledWith(1);
  });

  it('shows the error the form passes', () => {
    render(<Harness error="Add at least one picture" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Add at least one picture');
  });

  it('offers no main picture unless asked', () => {
    render(<Harness initial={pics(2, 0)} />);
    expect(screen.queryByText('Main')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /as main/ })).not.toBeInTheDocument();
  });

  describe('with selectableMain', () => {
    const mainOf = () => {
      const badge = screen.getByText('Main');
      return within(badge.parentElement!).getByRole('img').getAttribute('src');
    };

    it('makes the first upload the main picture', async () => {
      render(<Harness selectableMain />);
      pick(png('a.png'), png('b.png'));
      await waitFor(() => expect(srcs()).toHaveLength(2));
      expect(mainOf()).toBe('https://x/a.png');
      expect(screen.getAllByText('Main')).toHaveLength(1);
    });

    it('sets another picture as main', () => {
      const onValue = vi.fn();
      render(<Harness selectableMain initial={pics(3, 0)} onValue={onValue} />);
      expect(screen.queryByRole('button', { name: 'Set picture 1 as main' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Set picture 3 as main' }));
      expect(mainOf()).toBe('https://x/p3.png');
      expect(onValue.mock.calls.at(-1)![0].filter((i: GalleryImage) => i.isMain)).toEqual([
        expect.objectContaining({ id: 'p3' }),
      ]);
    });

    it('promotes the next picture when the main is removed', () => {
      render(<Harness selectableMain initial={pics(3, 1)} />);
      fireEvent.click(screen.getByRole('button', { name: 'Remove picture 2' }));
      expect(mainOf()).toBe('https://x/p3.png');
    });

    it('promotes the previous one when the main was last', () => {
      render(<Harness selectableMain initial={pics(3, 2)} />);
      fireEvent.click(screen.getByRole('button', { name: 'Remove picture 3' }));
      expect(mainOf()).toBe('https://x/p2.png');
    });

    it('keeps the main through a reorder', () => {
      render(<Harness selectableMain initial={pics(2, 0)} />);
      fireEvent.click(screen.getByRole('button', { name: 'Move picture 1 later' }));
      expect(srcs()).toEqual(['https://x/p2.png', 'https://x/p1.png']);
      expect(mainOf()).toBe('https://x/p1.png');
    });
  });

  it('hides every editing control when disabled', () => {
    render(<Harness initial={pics(2)} disabled />);
    expect(screen.queryByRole('button', { name: /Remove picture/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add pictures' })).toBeDisabled();
  });
});
