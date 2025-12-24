import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { LogEntry } from '@/components/logs/LogEntry';
import type { Log } from '@/api/types';

const mockLog: Log = {
  id: 'log-1',
  timestamp: '2024-01-15T14:30:00Z',
  level: 'error',
  message: 'Database connection failed',
  source: 'api/database.ts',
  project_id: 'proj-1',
  metadata: { host: 'db.example.com' },
};

describe('LogEntry', () => {
  it('should render log message', () => {
    const onPress = jest.fn();
    render(<LogEntry log={mockLog} onPress={onPress} />);

    expect(screen.getByText('Database connection failed')).toBeTruthy();
  });

  it('should render log source', () => {
    const onPress = jest.fn();
    render(<LogEntry log={mockLog} onPress={onPress} />);

    expect(screen.getByText('api/database.ts')).toBeTruthy();
  });

  it('should render timestamp', () => {
    const onPress = jest.fn();
    render(<LogEntry log={mockLog} onPress={onPress} />);

    // The exact format depends on locale, check for time pattern
    expect(screen.getByText(/\d{2}:\d{2}:\d{2}/)).toBeTruthy();
  });

  it('should render level badge', () => {
    const onPress = jest.fn();
    render(<LogEntry log={mockLog} onPress={onPress} />);

    expect(screen.getByText('ERROR')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    render(<LogEntry log={mockLog} onPress={onPress} />);

    fireEvent.press(screen.getByText('Database connection failed'));

    expect(onPress).toHaveBeenCalledWith(mockLog);
  });

  it('should not render source when not provided', () => {
    const onPress = jest.fn();
    const logWithoutSource: Log = { ...mockLog, source: undefined };
    render(<LogEntry log={logWithoutSource} onPress={onPress} />);

    expect(screen.queryByText('api/database.ts')).toBeNull();
  });

  it('should render different log levels correctly', () => {
    const onPress = jest.fn();

    const levels: Log['level'][] = ['debug', 'info', 'warning', 'error', 'fatal'];

    levels.forEach((level) => {
      const logWithLevel: Log = { ...mockLog, level };
      const { unmount } = render(<LogEntry log={logWithLevel} onPress={onPress} />);

      expect(screen.getByText(level.toUpperCase())).toBeTruthy();
      unmount();
    });
  });
});
