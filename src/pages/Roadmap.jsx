import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
const Roadmap = () => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const modules = [
    { title: 'HTML & CSS' }, { title: 'JavaScript' }, { title: 'Node.js' }, { title: 'MongoDB' },
    { title: 'Full Domain Review 1' }, { title: 'Mini Project' }, { title: 'React.js Fundamentals' },
    { title: 'React.js Intermediate' }, { title: 'React.js Advanced' }, { title: 'Redux & TailwindCSS' },
    { title: 'MERN Master Project 1' }, { title: 'AWS & nginx' }, { title: 'DSA' }, { title: 'PostgreSQL' },
    { title: 'TypeScript' }, { title: 'Next.js' }, { title: 'Full Domain Review 2' },
    { title: 'Next.js Master Project 2' }, { title: 'Docker & CI/CD' }, { title: 'Python' },
    { title: 'Agentic AI' }, { title: 'Micro Services' }, { title: 'System Design' },
    { title: 'Collaborative Master Project 3' }
  ];
  const getModuleColor = (index) => {
    const colors = [
      { bg: '#C9A96E', border: '#9B7D43', text: '#1C1A17' },
      { bg: '#9B7D43', border: '#6B4F2A', text: '#FAF7F2' },
      { bg: '#A8836A', border: '#7A5A40', text: '#FAF7F2' },
      { bg: '#B89A6E', border: '#8A6A40', text: '#1C1A17' },
      { bg: '#8A6C55', border: '#5A3C25', text: '#FAF7F2' },
      { bg: '#C4A882', border: '#9A7852', text: '#1C1A17' },
      { bg: '#7A6548', border: '#4A3520', text: '#FAF7F2' },
      { bg: '#D4B896', border: '#A48860', text: '#1C1A17' },
    ];
    return colors[index % colors.length];
  };
  const itemsPerRow = useMemo(() => {
    if (windowWidth < 640) return 1;
    if (windowWidth < 1024) return 2;
    return 4;
  }, [windowWidth]);
  const layout = useMemo(() => {
    return modules.map((module, index) => {
      const row = Math.floor(index / itemsPerRow) + 1;
      const colIndex = index % itemsPerRow;
      let col;
      if (itemsPerRow === 1) col = 1;
      else col = row % 2 !== 0 ? colIndex + 1 : itemsPerRow - colIndex;
      return { id: index, row, col, width: itemsPerRow === 1 ? 280 : 180 };
    });
  }, [modules, itemsPerRow]);
  const connections = useMemo(() => {
    const conns = [];
    for (let i = 0; i < modules.length - 1; i++) conns.push({ from: i, to: i + 1, type: 'solid' });
    return conns;
  }, [modules]);
  const calculatePosition = (item) => {
    const rowHeight = 140;
    const padding = 20;
    const containerWidth = Math.min(windowWidth, 1200);
    const effectiveWidth = containerWidth - (padding * 2);
    const nodeWidth = item.width;
    let x;
    if (itemsPerRow === 1) x = (windowWidth - nodeWidth) / 2;
    else {
      const baseSpacing = (effectiveWidth - nodeWidth) / (itemsPerRow - 1);
      const startX = (windowWidth - effectiveWidth) / 2;
      x = startX + (item.col - 1) * baseSpacing;
    }
    const y = 50 + (item.row - 1) * rowHeight;
    return { x, y };
  };
  const getConnectionPath = (from, to) => {
    const fromItem = layout.find((l) => l.id === from);
    const toItem = layout.find((l) => l.id === to);
    if (!fromItem || !toItem) return '';
    const fromPos = calculatePosition(fromItem);
    const toPos = calculatePosition(toItem);
    const nodeHeight = 50;
    const fromWidth = fromItem.width;
    const toWidth = toItem.width;
    const centerY = fromPos.y + nodeHeight / 2;
    if (Math.abs(fromPos.y - toPos.y) < 20) {
      const isLeftToRight = fromPos.x < toPos.x;
      const fromX = isLeftToRight ? fromPos.x + fromWidth : fromPos.x;
      const toX = isLeftToRight ? toPos.x : toPos.x + toWidth;
      return `M ${fromX} ${centerY} L ${toX} ${centerY}`;
    }
    const fromX = fromPos.x + fromWidth / 2;
    const toX = toPos.x + toWidth / 2;
    const fromY = fromPos.y + nodeHeight;
    const toY = toPos.y;
    const midY = fromY + 30;
    return `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;
  };
  const totalRows = Math.ceil(modules.length / itemsPerRow);
  const containerHeight = totalRows * 140 + 100;
  return (
    <div className="min-h-screen" style={{ paddingTop: '100px', paddingBottom: '48px', backgroundColor: '#F5F0E8' }}>
      <div className="w-full overflow-x-hidden">
        <div className="text-center mb-2 mt-2 px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-1" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>
            AI Full Stack Developer <span className="italic" style={{ color: '#9B7D43' }}>Roadmap</span>
          </h1>
        </div>
        <div className="relative w-full" style={{ minHeight: `${containerHeight}px`, padding: '10px 0' }}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1, overflow: 'visible' }}>
            <defs>
              <marker id="arrowhead" markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto">
                <polygon points="0 0, 4 2, 0 4" fill="#9B7D43" />
              </marker>
            </defs>
            {connections.map((conn, idx) => {
              const path = getConnectionPath(conn.from, conn.to);
              return (
                <path key={idx} d={path} stroke="#C9A96E" strokeWidth="2.5" fill="none"
                  strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#arrowhead)"
                  className="animate-flow" strokeDasharray="10, 5" />
              );
            })}
          </svg>
          <div className="relative" style={{ zIndex: 2 }}>
            {layout.map((item) => {
              const module = modules[item.id];
              if (!module) return null;
              const pos = calculatePosition(item);
              const color = getModuleColor(item.id);
              return (
                <div key={item.id} className="absolute transition-all duration-300 hover:scale-105"
                  style={{ left: `${pos.x}px`, top: `${pos.y}px`, width: `${item.width}px`, minHeight: '50px' }}>
                  <div className="rounded-lg px-4 py-3 text-center font-semibold relative shadow-md"
                    style={{ backgroundColor: color.bg, color: color.text, border: `2px solid ${color.border}` }}>
                    <div className="text-sm leading-tight relative z-10">{module.title}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes flow { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
        .animate-flow { animation: flow 2s linear infinite; }
      `}</style>
    </div>
  );
};
export default Roadmap;
