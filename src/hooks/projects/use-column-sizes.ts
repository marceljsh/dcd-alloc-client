import { useState } from "react";

export const useColumnSizes = (initialSizes: number[] = [50, 25, 25]) => {
  const [columnSizes, setColumnSizes] = useState(initialSizes);

  const handleColumnResize = (sizes: number[]) => {
    setColumnSizes(sizes);
  };

  const gridTemplate = `${columnSizes[0]}% ${columnSizes[1]}% ${columnSizes[2]}%`;

  return {
    columnSizes,
    gridTemplate,
    handleColumnResize,
  };
};
