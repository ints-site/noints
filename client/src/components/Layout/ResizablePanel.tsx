import React, { useState } from 'react';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';

interface ResizablePanelProps {
  children: React.ReactNode;
  width: number;
  minWidth: number;
  maxWidth: number;
  className?: string;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  width: initialWidth,
  minWidth,
  maxWidth,
  className = ''
}) => {
  const [width, setWidth] = useState(initialWidth);

  const onResize = (e: React.SyntheticEvent, { size }: { size: { width: number; height: number } }) => {
    if (size.width >= minWidth && size.width <= maxWidth) {
      setWidth(size.width);
    }
  };

  return (
    <Resizable
      width={width}
      height={Infinity}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
      handle={
        <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 z-10" />
      }
      axis="x"
      minConstraints={[minWidth, Infinity]}
      maxConstraints={[maxWidth, Infinity]}
    >
      <div style={{ width }} className={`relative ${className}`}>
        {children}
      </div>
    </Resizable>
  );
};

export default ResizablePanel; 