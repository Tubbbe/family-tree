import "primereact/resources/themes/lara-light-cyan/theme.css";

import React, {useCallback} from 'react';
import {Background, ConnectionLineType, Panel, ReactFlow, useEdgesState, useNodesState,} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import '@xyflow/react/dist/style.css';
import familyJson from './resources/family.json'
import {FamilyMember} from "./models/FamilyMember";
import {FamilyMemberNode} from "./components/FamilyMember/FamilyMemberNode";
import {Button} from "primereact/button";

const App = () => {
    const family: FamilyMember[] = familyJson.map(item => item as unknown as FamilyMember);

    const nodeTypes = {
        familyMemberNode: FamilyMemberNode,
    };

    const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 278;
    const nodeHeight = 200;

    const createNodesFromFamily = (family: FamilyMember[]) => {
        const nodes = [];
        for (const member of family) {
            nodes.push({
                id: member.id,
                data: {
                    label: <>
                        <span>{member.givenName + " " + member.surname.toUpperCase()}</span>
                        <br/>
                        <span>{member.born}{member.death ? ` - ${member.death}` : ""}</span>
                    </>
                },
                position: {x: 0, y: 0}
            });
        }

        return nodes;
    }

    const createEdgeIfNew = (edges: any[], id1: string, id2: string, type: string = "smoothstep") => {
        const edge = edges.find((item: {
            id: string;
        }) => item.id === id1 + "-" + id2 || item.id === id2 + "-" + id1)

        if (edge !== undefined) {
            return null;
        }

        return {
            id: id1 + "-" + id2,
            type: type,
            source: id1,
            target: id2,
        }
    }

    const createEdgesFromFamily = (family: FamilyMember[]) => {
        const edges = [];
        for (const member of family) {
            if (member.parents && member.parents?.length > 0) {
                for (const parent of member.parents) {
                    const edge = createEdgeIfNew(edges, parent, member.id);
                    if (edge !== null) {
                        edges.push(edge);
                    }
                }
            }

            if (member.adoptiveParents && member.adoptiveParents?.length > 0) {
                for (const parent of member.adoptiveParents) {
                    const edge = createEdgeIfNew(edges, parent, member.id);
                    if (edge !== null) {
                        edges.push(edge);
                    }
                }
            }

            if (member.children && member.children?.length > 0) {
                for (const child of member.children) {
                    const edge = createEdgeIfNew(edges, member.id, child);
                    if (edge !== null) {
                        edges.push(edge);
                    }
                }
            }
        }

        return edges;
    }

    const getLayoutedElements = (nodes: any, edges: any, direction = 'TB') => {
        const isHorizontal = direction === 'LR';
        dagreGraph.setGraph({rankdir: direction});

        nodes.forEach((node: any) => {
            dagreGraph.setNode(node.id, {width: nodeWidth, height: nodeHeight});
        });

        edges.forEach((edge: { source: dagre.Edge; target: string | { [key: string]: any; } | undefined; }) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        const newNodes = nodes.map((node: { id: string | dagre.Label; }) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            return {
                ...node,
                targetPosition: isHorizontal ? 'left' : 'top',
                sourcePosition: isHorizontal ? 'right' : 'bottom',
                position: {
                    x: nodeWithPosition.x - nodeWidth / 2,
                    y: nodeWithPosition.y - nodeHeight / 2,
                },
            };
        });

        return {nodes: newNodes, edges};
    };

    const {nodes: layoutedNodes, edges: layoutedEdges} = getLayoutedElements(
        createNodesFromFamily(family),
        createEdgesFromFamily(family)
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    const onLayout = useCallback(
        (direction: string | undefined) => {
            const {nodes: layoutedNodes, edges: layoutedEdges} = getLayoutedElements(
                nodes,
                edges,
                direction,
            );

            setNodes([...layoutedNodes]);
            setEdges([...layoutedEdges]);
        },
        [nodes, edges],
    );

    return (
        <div style={{width: "100vw", height: "100vw"}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                connectionLineType={ConnectionLineType.Straight}
                colorMode={"dark"}
                fitView
            >
                <Panel position="top-right">
                    <Button text outlined severity="secondary" label="Vertical layout" onClick={() => onLayout('TB')} />
                    <Button text outlined severity="secondary" label="Horizontal layout" onClick={() => onLayout('LR')} />
                </Panel>
                <Background/>
            </ReactFlow>
        </div>
    );
};

export default App;
