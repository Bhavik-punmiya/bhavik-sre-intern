import React from 'react';

export const SeverityBadge = ({ severity }) => {
  const styles = {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
    backgroundColor: `var(--${severity?.toLowerCase()}-bg)`,
    color: `var(--${severity?.toLowerCase()}-text)`,
    border: '1px solid transparent',
    display: 'inline-block'
  };

  return <span style={styles}>{severity}</span>;
};

export const StatusChip = ({ status }) => {
  const styles = {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500',
    backgroundColor: `var(--${status?.toLowerCase()}-bg)`,
    color: `var(--${status?.toLowerCase()}-text)`,
    border: '1px solid transparent',
    display: 'inline-block',
    textTransform: 'uppercase'
  };

  return <span style={styles}>{status}</span>;
};
