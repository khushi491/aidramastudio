# Custom Hooks

## usePagination

A custom React hook that provides pagination functionality for comic book panels.

### Features

- **Optimized Performance**: Uses `useMemo` to prevent unnecessary recalculations
- **Smooth Animations**: Built-in page flip animation with `isFlipping` state
- **Type Safety**: Full TypeScript support with proper interfaces
- **Reusable Logic**: Extracted from duplicate code in components

### Usage

```typescript
import { usePagination } from '../hooks/usePagination';

function MyComponent({ panels }: { panels: string[] }) {
  const {
    currentPage,
    isFlipping,
    pages,
    totalPages,
    isFirstPage,
    isLastPage,
    nextPage,
    prevPage,
    setCurrentPage
  } = usePagination(panels);

  return (
    <div>
      <button onClick={prevPage} disabled={isFirstPage || isFlipping}>
        Previous
      </button>
      <span>Page {currentPage + 1} of {totalPages}</span>
      <button onClick={nextPage} disabled={isLastPage || isFlipping}>
        Next
      </button>
    </div>
  );
}
```

### API

#### Parameters
- `panels: string[]` - Array of panel image URLs

#### Returns
- `currentPage: number` - Current page index (0-based)
- `isFlipping: boolean` - Whether page flip animation is active
- `pages: string[][]` - Array of pages, each containing up to 2 panels
- `totalPages: number` - Total number of pages
- `isFirstPage: boolean` - Whether currently on first page
- `isLastPage: boolean` - Whether currently on last page
- `nextPage: () => void` - Navigate to next page
- `prevPage: () => void` - Navigate to previous page
- `setCurrentPage: (page: number) => void` - Jump to specific page
