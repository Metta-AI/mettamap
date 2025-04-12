"use client";
import { useQueryState } from 'nuqs';

import { parseLimitParam } from './params';

export const LoadMoreButton = () => {
  const [limit, setLimit] = useQueryState(
    "limit",
    parseLimitParam.withOptions({ shallow: false })
  );
  return (
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
      onClick={() => setLimit(limit + 20)}
    >
      Load more
    </button>
  );
};
