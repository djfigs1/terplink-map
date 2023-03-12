import { SigmaContainer, useLoadGraph, useRegisterEvents } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import Graph from "graphology";
import React, { useEffect, useRef, useState } from "react";
import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";
import './TerpLinkMap.css';
import { useLayoutCirclepack } from "@react-sigma/layout-circlepack";
import { ClubListing, openClubOnTerpLinkWithKey } from "./Club";
import { ClubCard } from "./ClubCard";
import { MapSidebar } from "./MapSidebar";
import { Box, useTheme } from "@mui/material";


const MapIdentifier = "terplink_map"

type TerpLinkMapDataProps = {
    clubs: ClubListing[],
    onClubHover?: (club: ClubListing | undefined) => void
}

const TerpLinkMapData: React.FC<TerpLinkMapDataProps> = ({ clubs, onClubHover }) => {
    const loadGraph = useLoadGraph();
    let { positions, assign } = useLayoutCirclepack()
    const registerEvents = useRegisterEvents();
    const clubMap = useRef<Map<string, ClubListing>>(new Map());

    useEffect(() => {
        let clubScaleFactor = 2.5
        const graph = new Graph();
        clubMap.current.clear();
        clubs.forEach(club => {
            // ytpe: 'image', image: club.icon
            let icon = undefined; club.icon;
            graph.addNode(club.key, { x: 0, y: 0, size: clubScaleFactor * Math.sqrt(club.totalMembers / Math.PI), label: club.name, type: 'image', image: icon})
            clubMap.current.set(club.key, club);
        })

        registerEvents({
            enterNode: e => onClubHover?.call(this, clubMap.current.get(e.node)),
            leaveNode: e => onClubHover?.call(this, undefined),
            clickNode: e => openClubOnTerpLinkWithKey(e.node),
        })

        loadGraph(graph)
        assign()
    }, [loadGraph, clubs])

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
    const [ hoveredClub, setHoveredClub ] = useState<ClubListing | undefined>();
    const [ clubs, setClubs ] = useState<ClubListing[]>([]);
    const theme = useTheme();
    
    useEffect(() => {
        const storage = getStorage();
        const clubDataPathRef = ref(storage, 'clubs.json');
        getDownloadURL(clubDataPathRef).then(async url => {
            let clubData = await fetch(url);
            let j = await clubData.json();
            setClubs(j as ClubListing[]);
        })
    }, [])

    return <div id="map-grid">
        <SigmaContainer settings={{
            nodeProgramClasses: {
                image: getNodeProgramImage(),
            },
            defaultNodeColor: theme.palette.primary.main,
            labelColor: {
                color: theme.palette.text.primary
            },
        }} className="map">
            <TerpLinkMapData clubs={clubs} onClubHover={setHoveredClub} />
        </SigmaContainer>
        <div className="map-overlay">
            <MapSidebar clubs={clubs} />
        </div>
        { hoveredClub ? <div className="map-overlay">
            <Box className="hover-card">
                <ClubCard club={hoveredClub} showActions={false} />
            </Box>
        </div> : null }
    </div>
}
