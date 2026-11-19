import React from 'react';
import { cn } from '../lib/utils';

/**
 * The table every list in the console is drawn with — `DataTable` is built
 * from these, and a hand-laid table uses them directly so the two look the
 * same.
 *
 * The look, on purpose: a quiet white surface with one hairline border, no
 * header fill and no zebra stripes; small-caps column headings that recede;
 * roomy rows (16px above and below, 20px either side) separated by a
 * hairline; a soft highlight under the pointer. Numbers and actions align
 * right with `align="right"`.
 *
 *   <TableContainer>
 *     <Table>
 *       <TableHeader>
 *         <TableRow><TableHead>Client</TableHead></TableRow>
 *       </TableHeader>
 *       <TableBody>
 *         <TableRow><TableCell emphasis>Siti Aminah</TableCell></TableRow>
 *       </TableBody>
 *     </Table>
 *     <TableFooter>1–20 of 53</TableFooter>
 *   </TableContainer>
 */
export const TableContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn('overflow-hidden rounded-xl border border-border bg-card', className)}
      {...rest}
    >
      {children}
    </div>
  ),
);
TableContainer.displayName = 'TableContainer';

export const Table = React.forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
  ({ className, ...rest }, ref) => (
    <div className="overflow-x-auto">
      <table ref={ref} className={cn('w-full border-collapse text-left text-sm', className)} {...rest} />
    </div>
  ),
);
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...rest }, ref) => (
  <thead ref={ref} className={cn('border-b border-border', className)} {...rest} />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...rest }, ref) => (
  <tbody ref={ref} className={cn('divide-y divide-border/70', className)} {...rest} />
));
TableBody.displayName = 'TableBody';

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Turns off the highlight under the pointer — for a header row, or a
   *  row that is a message rather than a record. */
  plain?: boolean;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, plain, ...rest }, ref) => (
    <tr
      ref={ref}
      className={cn(!plain && 'transition-colors hover:bg-muted/40', className)}
      {...rest}
    />
  ),
);
TableRow.displayName = 'TableRow';

type Align = 'left' | 'right' | 'center';
const alignClass: Record<Align, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, align = 'left', scope = 'col', ...rest }, ref) => (
    <th
      ref={ref}
      scope={scope}
      className={cn(
        'h-11 whitespace-nowrap px-5 text-xs font-medium uppercase tracking-wider text-muted-foreground',
        alignClass[align],
        className,
      )}
      {...rest}
    />
  ),
);
TableHead.displayName = 'TableHead';

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
  /** The column a row is recognised by — a name, a title. Drawn darker and
   *  a little heavier than the rest. */
  emphasis?: boolean;
  /** Secondary information: drawn in the muted text colour. */
  muted?: boolean;
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align = 'left', emphasis, muted, ...rest }, ref) => (
    <td
      ref={ref}
      className={cn(
        'px-5 py-4 align-middle',
        alignClass[align],
        emphasis ? 'font-medium text-foreground' : muted ? 'text-muted-foreground' : 'text-foreground',
        className,
      )}
      {...rest}
    />
  ),
);
TableCell.displayName = 'TableCell';

/** The strip under the rows: a count on the left, paging on the right. */
export const TableFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-sm text-muted-foreground',
        className,
      )}
      {...rest}
    />
  ),
);
TableFooter.displayName = 'TableFooter';

export interface TablePagerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

/** Previous / Next in a table's footer. */
export const TablePagerButton = React.forwardRef<HTMLButtonElement, TablePagerButtonProps>(
  ({ className, type = 'button', ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex h-9 items-center gap-1 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors',
        'hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20',
        'disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
      {...rest}
    />
  ),
);
TablePagerButton.displayName = 'TablePagerButton';
