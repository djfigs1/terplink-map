import { SearchControl, SigmaContainer, useLoadGraph, useRegisterEvents } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import Graph from "graphology";
import React, { useEffect, useMemo, useRef, useState } from "react";
import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";
import './TerpLinkMap.css';
import { useLayoutCirclepack } from "@react-sigma/layout-circlepack";
import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import { ClubListing, openClubOnTerpLink, openClubOnTerpLinkWithKey } from "./Club";
import { ClubCard } from "./ClubCard";
import { MapSidebar } from "./MapSidebar";
import { Box, useTheme } from "@mui/material";
import ClubIntersections from './club_intersections.json'

const MapIdentifier = "terplink_map"

type TerpLinkMapDataProps = {
    clubs: ClubListing[],
    edges: Record<string, Record<string, number>>
    onClubHover?: (club: ClubListing | undefined, common: ClubListing[]) => void
}

const TerpLinkMapData: React.FC<TerpLinkMapDataProps> = ({ clubs, edges, onClubHover }) => {
    const loadGraph = useLoadGraph();
    let { positions, assign } = useLayoutCirclepack()
    const registerEvents = useRegisterEvents();
    const clubMap = useRef<Map<string, ClubListing>>(new Map());
    const edgeMap = useRef<Map<string, Map<string, number>>>(new Map());

    function hover(graph: Graph, clubId: string | undefined) {
        graph.clearEdges()

        if (onClubHover) {
            let common: ClubListing[] = []
            if (clubId) {
                let clubEdgeMap = edgeMap.current.get(clubId)!
                common = Array.from(clubEdgeMap.keys())
                    .map(k => ({
                        ...clubMap.current.get(k)!,
                        commonMemberCount: clubEdgeMap.get(k)
                    }))
                    .sort((a,b) => clubEdgeMap.get(b.id)! - clubEdgeMap.get(a.id)!)
            }
            onClubHover(clubId ? clubMap.current.get(clubId) : undefined, common)
        }

        if (clubId) {
            let edges = edgeMap.current.get(clubId);
            if (edges) {
                edges.forEach((weight, otherClubId) => {
                    graph.addEdge(clubId, otherClubId, { size: Math.log(weight), type: 'arrow' })
                })
            }
        }

        loadGraph(graph)
    }

    useEffect(() => {
        let clubScaleFactor = 1.5
        const graph = new Graph();
        clubMap.current.clear();

        clubs.forEach(club => {
            // ytpe: 'image', image: club.icon
            let icon = club.icon;
            graph.addNode(club.id, { x: 0, y: 0, size: clubScaleFactor * Math.sqrt(club.totalMembers / Math.PI), label: club.name, type: 'image', image: icon })
            clubMap.current.set(club.id, club);
        })

        // Get edges
        edgeMap.current.clear();
        Object.keys(edges).forEach(e => {
            let clubEdgeMap = new Map<string, number>();
            Object.keys(edges[e]).forEach(e2 => {
                clubEdgeMap.set(e2, edges[e][e2])
            });

            edgeMap.current.set(e, clubEdgeMap);
        })

        registerEvents({
            enterNode: e => hover(graph, e.node),
            leaveNode: e => hover(graph, undefined),
            clickNode: e => openClubOnTerpLink(clubMap.current.get(e.node)!),
        })

        loadGraph(graph)
        assign()
    }, [loadGraph, clubs, edges])

    return null;
}

function getTextFromHTMLString(text: string) {
    let div = document.createElement("div")
    div.innerHTML = text;
    let string = div.innerText;
    div.remove();

    return string;
}


export const TerpLinkMap: React.FC = ({ }) => {
    const [hoveredClub, setHoveredClub] = useState<ClubListing | undefined>();
    const [commonClubs, setCommonClubs] = useState<ClubListing[]>([]);
    const [clubs, setClubs] = useState<ClubListing[]>([]);
    const [edges, setEdges] = useState<Record<string, Record<string, number>>>({});
    const theme = useTheme();

    useEffect(() => {
        const storage = getStorage();
        const clubDataPathRef = ref(storage, 'clubs.json');
        getDownloadURL(clubDataPathRef).then(async url => {
            let clubData = await fetch(url);
            let j = await clubData.json();
            setClubs(j as ClubListing[]);
        })

        setEdges(ClubIntersections);
    }, [])

    const onClubHover = (club: ClubListing | undefined, common: ClubListing[]) => {
        setHoveredClub(club)
        setCommonClubs(common)
    }

    return <div id="map-grid">
        <SigmaContainer settings={{
            nodeProgramClasses: {
                image: getNodeProgramImage(),
            },
            defaultNodeColor: theme.palette.primary.main,
            defaultEdgeColor: theme.palette.secondary.main,
            edgeLabelColor: {
                color: theme.palette.text.primary,
            },
            labelColor: {
                color: theme.palette.text.primary
            },
        }} className="map">
            <TerpLinkMapData clubs={clubs} edges={edges} onClubHover={onClubHover} />
        </SigmaContainer>
        <div className="map-overlay">
            <MapSidebar clubs={clubs} />
        </div>
        {hoveredClub ? <div className="map-overlay">
            <Box className="hover-card">
                <ClubCard club={hoveredClub} common={commonClubs} showActions={false} />
            </Box>
        </div> : null}
    </div>
}
