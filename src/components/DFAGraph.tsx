import React, { useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
// @ts-ignore
import dagre from 'cytoscape-dagre';
import { useDFAStore } from '../store/dfaStore';
import { getStepCytoscapeElements } from '../utils/cytoscapeUtils';

// Register dagre extension
cytoscape.use(dagre);

export const DFAGraph: React.FC = () => {
  const { dfa, steps, currentStepIndex } = useDFAStore();

  const elements = useMemo(() => {
    if (!dfa || !steps.length) return [];
    const step = steps[currentStepIndex];
    return CytoscapeComponent.normalizeElements(getStepCytoscapeElements(dfa, step));
  }, [dfa, steps, currentStepIndex]);

  if (!dfa) return null;

  const layout = {
    name: 'dagre',
    rankDir: 'LR',
    spacingFactor: 1.25,
    directed: true,
    padding: 20,
    animate: false,
    fit: true,
  };

  const stylesheet: any[] = [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': 'data(bgColor)',
        'border-width': 2,
        'border-color': '#4f46e5', // indigo-600
        'color': '#0f172a', // slate-900 (WCAG contrast validated)
        'width': 50,
        'height': 50,
        'font-family': 'Inter, sans-serif',
        'font-size': '14px',
        'font-weight': '600', // boosted for legibility
      }
    },
    {
      selector: 'node.accept',
      style: {
        'border-width': 5,
        'border-style': 'double',
        'border-color': '#22c55e', // green-500
      }
    },
    {
      selector: 'node.start',
      style: {} // background color is now dynamic, we can remove its override
    },
    {
      selector: 'node.pseudo-start',
      style: {
        'width': 1,
        'height': 1,
        'background-color': 'transparent',
        'border-width': 0,
        'label': ''
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#cbd5e1', // slate-300
        'target-arrow-color': '#cbd5e1',
        // @ts-ignore
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '12px',
        'color': '#334155', // slate-700
        'text-background-opacity': 1,
        'text-background-color': '#ffffff',
        'text-background-padding': '4px',
        'text-background-shape': 'roundrectangle',
        'control-point-step-size': 60
      }
    },
    {
      selector: 'edge.pseudo-edge',
      style: {
        'line-color': '#4f46e5',
        'target-arrow-color': '#4f46e5',
        'text-background-color': 'transparent',
        'color': '#4f46e5',
        'font-size': '12px',
        'font-weight': '600'
      }
    }
  ];

  return (
    <div className="w-full h-full bg-slate-50 relative flex-1">
      <CytoscapeComponent
        key={`graph-${currentStepIndex}-${dfa?.states.join(',')}`}
        elements={elements}
        style={{ width: '100%', height: '100%' }}
        stylesheet={stylesheet}
        layout={layout}
        minZoom={0.5}
        maxZoom={3}
      />
    </div>
  );
};
