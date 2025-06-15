
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  width?: number;
  renderItem: ({ index, style, data }: { index: number; style: React.CSSProperties; data: T[] }) => React.ReactNode;
  searchable?: boolean;
  searchKey?: keyof T;
  placeholder?: string;
  className?: string;
}

function VirtualListComponent<T extends Record<string, any>>({
  items,
  itemHeight,
  height,
  width = 400,
  renderItem,
  searchable = false,
  searchKey,
  placeholder = "Search...",
  className = "",
}: VirtualListProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const listRef = useRef<List>(null);

  const filteredItems = useMemo(() => {
    if (!searchable || !searchTerm || !searchKey) return items;
    
    return items.filter(item => {
      const value = item[searchKey];
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [items, searchTerm, searchKey, searchable]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Scroll to top when search changes
    if (listRef.current) {
      listRef.current.scrollToItem(0);
    }
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {searchable && (
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      )}
      
      <div className="border rounded-lg overflow-hidden">
        <List
          ref={listRef}
          height={height}
          width={width}
          itemCount={filteredItems.length}
          itemSize={itemHeight}
          itemData={filteredItems}
        >
          {renderItem}
        </List>
      </div>
    </div>
  );
}

export const VirtualList = React.memo(VirtualListComponent) as typeof VirtualListComponent;
