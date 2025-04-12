"use client";
import {
  FC,
  useMemo,
  useState,
} from 'react';

import yaml from 'js-yaml';
import { useQueryState } from 'nuqs';

import {
  FilterItem,
  parseFilterParam,
} from '@/app/params';
import { MapFile } from '@/server/types';

import { Button } from './Button';
import { MapViewer } from './MapViewer';

export const ExtendedMapViewer: FC<{ map: MapFile }> = ({ map }) => {
  const [filters, setFilters] = useQueryState(
    "filter",
    parseFilterParam.withOptions({ shallow: false })
  );
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Parse the frontmatter YAML
  const frontmatterData = useMemo(() => {
    try {
      return yaml.load(map.content.frontmatter) as Record<string, any>;
    } catch (error) {
      console.error("Error parsing frontmatter:", error);
      return {};
    }
  }, [map.content.frontmatter]);

  // Function to handle clicking on a frontmatter line
  const handleFrontmatterClick = (key: string, value: string) => {
    const newFilter: FilterItem = { key, value };

    // Check if this filter already exists
    const filterExists =
      filters?.some((filter) => filter.key === key && filter.value === value) ||
      false;

    if (filterExists) {
      // Remove the filter if it already exists
      setFilters(
        filters?.filter(
          (filter) => !(filter.key === key && filter.value === value)
        ) || []
      );
    } else {
      // Add the new filter
      setFilters([...(filters || []), newFilter]);
    }
  };

  // Function to check if a key-value pair is currently in the filters
  const isFiltered = (key: string, value: string) => {
    return (
      filters?.some((filter) => filter.key === key && filter.value === value) ||
      false
    );
  };

  // Function to render a key-value pair as a clickable line
  const renderFrontmatterLine = (
    key: string,
    value: any,
    path: string = ""
  ) => {
    const fullKey = path ? `${path}.${key}` : key;

    if (typeof value === "object" && value !== null) {
      return (
        <div key={fullKey} className="ml-4">
          <div className="font-bold">{key}:</div>
          {Object.entries(value).map(([k, v]) =>
            renderFrontmatterLine(k, v, fullKey)
          )}
        </div>
      );
    }

    const isActive = isFiltered(fullKey, String(value));

    return (
      <div
        key={fullKey}
        className={`cursor-pointer hover:bg-blue-100 p-1 rounded ${
          isActive ? "bg-blue-200" : ""
        }`}
        onClick={() => handleFrontmatterClick(fullKey, String(value))}
      >
        <span className="font-bold">{key}:</span> {String(value)}
      </div>
    );
  };

  // Function to copy map data to clipboard
  const copyMapDataToClipboard = () => {
    try {
      navigator.clipboard.writeText(map.content.data);
      setCopySuccess("Map data copied to clipboard!");
      setTimeout(() => setCopySuccess(null), 3000);
    } catch (err) {
      setCopySuccess("Failed to copy map data");
      setTimeout(() => setCopySuccess(null), 3000);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="text-xs overflow-auto max-h-[80vh] w-[400px] border border-gray-200 rounded p-4">
        {Object.entries(frontmatterData).map(([key, value]) =>
          renderFrontmatterLine(key, value)
        )}
      </div>
      <div className="col-span-1">
        <MapViewer data={map.content.data} />
      </div>
      <div className="flex flex-col items-center justify-start">
        <Button onClick={copyMapDataToClipboard}>
          Copy Map Data to Clipboard
        </Button>
        {copySuccess && (
          <div
            className={`text-sm ${
              copySuccess.includes("Failed") ? "text-red-500" : "text-green-500"
            }`}
          >
            {copySuccess}
          </div>
        )}
      </div>
    </div>
  );
};
