import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableHeader,
  TablePagerButton,
  TableRow,
} from '../components/Table';
import { DataTable } from '../components/DataTable';

describe('Table primitives', () => {
  it('lay out a real table: column headers, rows, cells, and a footer', () => {
    render(
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow plain>
              <TableHead>Client</TableHead>
              <TableHead align="right">Orders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell emphasis>Siti Aminah</TableCell>
              <TableCell align="right">12</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <TableFooter>
          <span>1–1 of 1</span>
          <TablePagerButton disabled>Next</TablePagerButton>
        </TableFooter>
      </TableContainer>,
    );

    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('columnheader')).toHaveLength(2);
    expect(within(table).getByRole('columnheader', { name: 'Client' }).getAttribute('scope')).toBe('col');
    expect(within(table).getByRole('cell', { name: 'Siti Aminah' }).className).toContain('font-medium');
    expect(within(table).getByRole('cell', { name: '12' }).className).toContain('text-right');
    expect(screen.getByText('1–1 of 1')).toBeTruthy();
    const next = screen.getByRole('button', { name: 'Next' }) as HTMLButtonElement;
    expect(next.disabled).toBe(true);
    expect(next.type).toBe('button');
  });

  it('a plain row has no pointer highlight; a record row does', () => {
    render(
      <table>
        <tbody>
          <TableRow plain data-testid="plain" />
          <TableRow data-testid="record" />
        </tbody>
      </table>,
    );
    expect(screen.getByTestId('plain').className).not.toContain('hover:bg-muted');
    expect(screen.getByTestId('record').className).toContain('hover:bg-muted');
  });
});

describe('DataTable', () => {
  const rows = Array.from({ length: 12 }, (_, i) => ({ id: `C${i + 1}`, name: `Collector ${i + 1}` }));
  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
  ];

  it('draws the rows with the count and paging in the table’s own footer', () => {
    render(<DataTable columns={columns} data={rows} pageSize={10} />);
    expect(screen.getAllByRole('row')).toHaveLength(11);
    expect(screen.getByText('Showing 1–10 of 12')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Prev' }) as HTMLButtonElement).disabled).toBe(true);

    screen.getByRole('button', { name: 'Next' }).click();
    return screen.findByText('Showing 11–12 of 12');
  });

  it('says so when there is nothing to show', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="No collectors yet." />);
    expect(screen.getByText('No collectors yet.')).toBeTruthy();
    expect(screen.getByText('0 results')).toBeTruthy();
  });
});
