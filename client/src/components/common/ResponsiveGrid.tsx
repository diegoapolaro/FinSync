import React, { ReactNode } from 'react';

interface Props {
  cols?: 1 | 2 | 3 | 4;
  gap?: 2 | 3 | 4 | 5 | 6;
  children?: ReactNode;
}

export default function ResponsiveGrid({ cols = 3, gap = 4, children }: Props) {
  const colMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };
  const gapMap: Record<number, string> = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
  };
  return (
    <div className={'grid ' + (colMap[cols] || colMap[3]) + ' ' + (gapMap[gap] || gapMap[4])}>
      {children}
    </div>
  );
}
