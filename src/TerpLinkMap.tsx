import { SigmaContainer, useLoadGraph, useRegisterEvents } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import Graph from "graphology";
import React, { useEffect, useRef, useState, useMemo } from "react";
import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";
import ClubData from "./clubs.json";
import './TerpLinkMap.css';

import { Card, CardContent, Stack, TextField } from "@mui/material";
import Divider from "@mui/material/Divider";
import { useLayoutCirclepack } from "@react-sigma/layout-circlepack";
import { Box } from "@mui/system";

type ClubListing = {
    id: string,
    key: string,
    shortName: string | null,
    name: string,
    summary: string,
    description: string,
    status: string,
    categories: string[],
    totalMembers: number,
    icon?: string
}

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
            let icon = club.icon;
            graph.addNode(club.key, { x: 0, y: 0, size: clubScaleFactor * Math.sqrt(club.totalMembers / Math.PI), label: club.name, type: 'image', image: icon})
            clubMap.current.set(club.key, club);
        })

        registerEvents({
            enterNode: e => onClubHover?.call(this, clubMap.current.get(e.node)),
            leaveNode: e => onClubHover?.call(this, undefined),
            clickNode: e => {
                window.open(`https://terplink.umd.edu/organization/${e.node}`, '_blank')
            },
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
    const [ clubs, setClubs ] = useState<ClubListing[]>(ClubData as any);
    const [ clubFilter, setClubFilter ] = useState<string>("");

    const clubCards = useMemo(() => {
        let clubFilterLowerCase = clubFilter.toLowerCase();
        return clubs.filter(c => c.name.toLowerCase().includes(clubFilterLowerCase)).map(c => <Card key={"card-" + c.key}>
            <CardContent>
                <h4>{c.name}</h4>
                <Divider />
                <p>{c.summary}</p>
            </CardContent>
        </Card>)
    }, [clubs, clubFilter])

    return <div id="map-grid">
        <SigmaContainer settings={{
            nodeProgramClasses: {
                image: getNodeProgramImage(),
            },
            labelSize: 8,
        }} className="map">
            <TerpLinkMapData clubs={clubs} onClubHover={setHoveredClub} />
        </SigmaContainer>
        <div className="map-overlay">
            <Card id="map-sidebar">
                <Box>
                    <h1>TerpMap</h1>
                    <TextField fullWidth
                        variant="filled"
                        value={clubFilter}
                        onChange={e => setClubFilter(e.target.value)}
                        label="Search for a Club..."
                        sx={{backgroundColor: "white"}}
                    />
                </Box>
                <Box className="club-list">
                    <Stack spacing={1} >
                        {clubCards}
                    </Stack>
                </Box>
            </Card>
        </div>
        { hoveredClub ? <div className="map-overlay">
            <Card className="hover-card">
                <h2>{hoveredClub.name}</h2>
                <h4>{hoveredClub.totalMembers} members</h4>
                <Divider />
                <p>{getTextFromHTMLString(hoveredClub.description)}</p>
            </Card> 
        </div> : null }
    </div>
}
