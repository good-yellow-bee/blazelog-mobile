import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Chip, Searchbar, useTheme, Text } from 'react-native-paper';
import type { LogLevel, LogFilters } from '@/api/types';
import type { BlazelogTheme } from '@/theme';

// Internal filter state with levels as array
export interface LogFilterState {
  start: string;
  end?: string;
  levels?: LogLevel[];
  q?: string;
  source?: string;
}

interface LogFilterProps {
  filters: LogFilterState;
  onFiltersChange: (filters: LogFilterState) => void;
}

const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warning', 'error', 'fatal'];

// Convert internal filter state to API format
export const toApiFilters = (state: LogFilterState): LogFilters => ({
  ...state,
  levels: state.levels?.join(','),
});

export const LogFilter = ({ filters, onFiltersChange }: LogFilterProps) => {
  const theme = useTheme<BlazelogTheme>();
  const [searchQuery, setSearchQuery] = useState(filters.q || '');

  const getLevelColor = (level: LogLevel): string => {
    return theme.custom.colors[level] ?? theme.custom.colors.info;
  };

  const handleLevelToggle = (level: LogLevel) => {
    const currentLevels = filters.levels || [];
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter((l) => l !== level)
      : [...currentLevels, level];

    onFiltersChange({
      ...filters,
      levels: newLevels.length > 0 ? newLevels : undefined,
    });
  };

  const handleSearchSubmit = () => {
    onFiltersChange({
      ...filters,
      q: searchQuery || undefined,
    });
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    onFiltersChange({
      ...filters,
      q: undefined,
    });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline },
      ]}
    >
      <Searchbar
        placeholder="Search logs..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearchSubmit}
        onClearIconPress={handleSearchClear}
        style={[styles.searchbar, { backgroundColor: theme.colors.surfaceVariant }]}
        inputStyle={styles.searchInput}
      />
      <View style={styles.levelContainer}>
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Level:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {LOG_LEVELS.map((level) => {
            const isSelected = filters.levels?.includes(level) || false;
            const color = getLevelColor(level);
            return (
              <Chip
                key={level}
                selected={isSelected}
                onPress={() => handleLevelToggle(level)}
                style={[styles.chip, isSelected && { backgroundColor: `${color}30` }]}
                textStyle={[
                  styles.chipText,
                  { color: isSelected ? color : theme.colors.onSurfaceVariant },
                ]}
                showSelectedCheck={false}
              >
                {level.toUpperCase()}
              </Chip>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  searchbar: {
    marginBottom: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    marginRight: 8,
    fontWeight: '500',
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    height: 28,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
