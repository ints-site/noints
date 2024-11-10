import React, { useState } from 'react';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
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

  const onResize = (_: React.SyntheticEvent, data: ResizeCallbackData) => {
    const newWidth = data.size.width;
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setWidth(newWidth);
    }
  };

  return (
    <ResizableBox
      width={width}
      height={window.innerHeight}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
      handle={
        <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 z-10" />
      }
      axis="x"
      minConstraints={[minWidth, 100]}
      maxConstraints={[maxWidth, window.innerHeight]}
      resizeHandles={['e']}
    >
      <div className={`relative ${className}`} style={{ width, height: '100%' }}>
        {children}
      </div>
    </ResizableBox>
  );
};

export default ResizablePanel; 