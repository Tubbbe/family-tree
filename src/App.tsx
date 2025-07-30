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

    const getGenderColor = (gender: "M" | "F" | "NB" | undefined) => {
        switch (gender) {
            case "M":
                return "#bdebfd";
            case "F":
                return "#fbdde3";
            case "NB":
                return "#f5f0cd";
            default:
                return "white";
        }
    }

    const createNodesFromFamily = (family: FamilyMember[]) => {
        const nodes = [];
        for (const member of family) {
            nodes.push({
                id: member.id,
                type: 'familyMemberNode',
                data: {
                    ...member,
                    genderColor: getGenderColor(member.gender)
                },
                position: {x: 0, y: 0},
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
            member.parentMembers = [];
            member.childMembers = [];
            member.spousesAndDivorced = [];

            if (member.parents && member.parents?.length > 0) {
                for (const parent of member.parents) {
                    const edge = createEdgeIfNew(edges, parent, member.id);
                    if (edge !== null) {
                        edges.push(edge);
                    }

                    const parentMember = family.find((item) => item.id === parent);
                    if (parentMember) {
                        member.parentMembers && member.parentMembers.push(parentMember);
                    }
                }
            }

            if (member.adoptiveParents && member.adoptiveParents?.length > 0) {
                for (const parent of member.adoptiveParents) {
                    const edge = createEdgeIfNew(edges, parent, member.id);
                    if (edge !== null) {
                        edges.push(edge);
                    }

                    const parentMember = family.find((item) => item.id === parent);
                    if (parentMember) {
                        member.parentMembers && member.parentMembers.push(parentMember);
                    }
                }
            }

            if (member.children && member.children?.length > 0) {
                for (const child of member.children) {
                    const edge = createEdgeIfNew(edges, member.id, child);
                    if (edge !== null) {
                        edges.push(edge);
                    }

                    const childMember = family.find((item) => item.id === child);
                    if (childMember) {
                        member.childMembers && member.childMembers.push(childMember);
                    }
                }
            }

            if (member.spouses && member.spouses.length > 0) {
                for (const spouse of member.spouses) {
                    const spouseMember = family.find((item) => item.id === spouse);
                    if (spouseMember) {
                        member.spousesAndDivorced && member.spousesAndDivorced.push(spouseMember);
                    }
                }
            }

            if (member.divorced && member.divorced.length > 0) {
                for (const exSpouse of member.divorced) {
                    const divorcedMember = family.find((item) => item.id === exSpouse);
                    if (divorcedMember) {
                        member.spousesAndDivorced && member.spousesAndDivorced.push(divorcedMember);
                    }
                }
            }
        }

        return { edges, family };
    }

    const setDepth = (member: FamilyMember, depth: number, alreadyProcessed: string[]) => {
        if (!alreadyProcessed.includes(member.id)) {
            member.depth = depth;
            alreadyProcessed.push(member.id);

            if (member.childMembers && member.childMembers?.length > 0) {
                for (const child of member.childMembers) {
                    setDepth(child, depth + 1, alreadyProcessed);
                }
            }

            if (member.parentMembers && member.parentMembers?.length > 0) {
                for (const parent of member.parentMembers) {
                    setDepth(parent, depth - 1, alreadyProcessed);
                }
            }

            if (member.spousesAndDivorced && member.spousesAndDivorced?.length > 0) {
                for (const spouseOrDivorced of member.spousesAndDivorced) {
                    setDepth(spouseOrDivorced, depth, alreadyProcessed);
                }
            }
        }
    }

    const setDepths = (family: FamilyMember[]) => {
        const randomRoot: FamilyMember = family.filter((item) => item.parents && item.parents?.length > 0 && item.children && item.children?.length > 0)[0];

        const alreadyProcessed: string[] = [];

        setDepth(randomRoot, 0, alreadyProcessed);
        const maxDepth = Math.max(...family.filter(item => !isNaN(item.depth)).map(item => item.depth));
        const minDepth = Math.min(...family.filter(item => !isNaN(item.depth)).map(item => item.depth))

        return maxDepth - minDepth;
    }

    const setXPosition = (previousMember: FamilyMember | null, member: FamilyMember, x: number, alreadyProcessed: string[]) => {
        if (!alreadyProcessed.includes(member.id)) {
            alreadyProcessed.push(member.id);

            if (member.spousesAndDivorced && member.spousesAndDivorced?.length > 0) {
                for (const spouseOrDivorced of member.spousesAndDivorced) {
                    setXPosition(member, spouseOrDivorced, x, alreadyProcessed);
                }
            }

            member.xPosition = x;
        }
    }

    const setXPositions = (family: FamilyMember[]) => {
        const roots: FamilyMember[] = family.filter((item) => item.parentMembers?.length === 0);

        const alreadyProcessed: string[] = [];
        for (const root of roots) {
            setXPosition(null, root, 500, alreadyProcessed);
        }
    }

    const changePositions = (nodes: any, edges: any) => {
        const newNodes: any[] = [];

        let x = 0;
        for (const node of nodes) {
            newNodes.push({
                ...node,
                position: {x: x || 0, y: node.data.depth * 200 || 0}
            });
            x += 50;
        }

        return { nodes: newNodes, edges };
    }

    const { edges: createdEdges, family: familyMembers } = createEdgesFromFamily(family);
    setDepths(familyMembers);
    setXPositions(familyMembers);
    console.log(familyMembers);
    const { nodes: calculatedNodes, edges: calculatedEdges } = changePositions(createNodesFromFamily(familyMembers), createdEdges);

    const [nodes, setNodes, onNodesChange] = useNodesState(calculatedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(calculatedEdges);

    return (
        <div style={{width: "100vw", height: "100vw"}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                connectionLineType={ConnectionLineType.Straight}
                fitView
            >
                <Background/>
            </ReactFlow>
        </div>
    );
};

export default App;
