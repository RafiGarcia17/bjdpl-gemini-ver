import React from 'react';
import { formatPercent } from '../utils/format.js';

export default function ProgressBar({ percent = 0, label = '' }) {
  const safePercent = Number(percent) || 0;
  const clampedWidth = Math.min(Math.max(safePercent, 0), 100);
  const isOver = safePercent > 100;

  return (
    <div className="progress-wrap" title={label || formatPercent(safePercent)}>
      <div className="progress-track">
        <div
          className={`progress-fill ${isOver ? 'is-over' : ''}`}
          style={{ width: `${clampedWidth}%` }}
        />
      </div>
      <span className={`progress-text ${isOver ? 'is-over-text' : ''}`}>
        {formatPercent(safePercent, 1)}
      </span>
    </div>
  );
}
